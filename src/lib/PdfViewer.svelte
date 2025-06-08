<script>
  import * as pdfjs from 'pdfjs-dist';
  import { onDestroy, tick } from 'svelte';
  import { calcRT, getPageText, onPrint, savePDF } from './utils/Helper.svelte';
  import Tooltip from './utils/Tooltip.svelte';

  export let url;
  export let data = null;
  export let scale = 1.8;
  export let pageNum = 1;
  export let flipTime = 120;
  export let showButtons = [
    'navigation',
    'zoom',
    'print',
    'rotate',
    'download',
    'autoflip',
    'timeInfo',
    'pageInfo',
  ];
  export let showBorder = true;
  export let totalPage = 0;
  export let downloadFileName = '';
  export let showTopButton = true;
  export let onProgress = undefined;
  export let externalLinksTarget = '_blank';

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  let canvas;
  let currentPage = 1;
  let pageCount = 0;
  let pdfDoc = null;
  let pageRendering = false;
  let pageNumPending = null;
  let rotation = 0;
  let pdfContent = '';
  let readingTime = 0;
  let autoFlip = false;
  let interval;
  let secondInterval;
  let seconds = flipTime;
  let pages = [];
  let password = '';
  let passwordError = false;
  let passwordMessage = '';
  let isInitialized = false;
  const minScale = 1.0;
  const maxScale = 2.3;

  const renderPage = async (num) => {
    if (num < 1 || num > pageCount) return;
    pageRendering = true;
    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale, rotation });
      const canvasContext = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext,
        viewport,
      };
      await page.render(renderContext).promise;

      // Handle PDF links
      await handlePageLinks(page, viewport);

      pageRendering = false;
      currentPage = num;
      if (pageNumPending !== null) {
        if (pageNum < pdfDoc.numPages) {
          pages[pageNum -1] = canvas.cloneNode(true);
          pageNum++;
          await renderPage(pageNum);
        } else {
            for (let i = 0; i < pages.length; i++) {
                canvas.parentNode.insertBefore(pages[i], canvas);
            }
            canvas.remove();
        }
        pageNumPending = null;
      }
      // Update page counters
      showButtons.length ? (pageNum = num) : null;
    } catch (error) {
      console.error("Error rendering page:", error);
      pageRendering = false;
    }
  };

  const handlePageLinks = async (page, viewport) => {
    try {
      const annotations = await page.getAnnotations();
      
      // Remove existing link overlays for this page
      const existingLinks = canvas.parentNode.querySelectorAll('.pdf-link-overlay');
      existingLinks.forEach(link => link.remove());

      annotations.forEach(annotation => {
        if (annotation.subtype === 'Link' && annotation.url) {
          createLinkOverlay(annotation, viewport);
        }
      });
    } catch (error) {
      console.warn('Could not process page annotations:', error);
    }
  };

  const createLinkOverlay = (annotation, viewport) => {
    const linkElement = document.createElement('a');
    linkElement.className = 'pdf-link-overlay';
    linkElement.href = annotation.url;
    linkElement.target = externalLinksTarget;
    linkElement.rel = 'noopener noreferrer';
    
    // Convert PDF coordinates to canvas coordinates
    const rect = annotation.rect;
    const [x1, y1, x2, y2] = rect;
    
    // Transform coordinates using viewport
    const canvasRect = viewport.convertToViewportRectangle([x1, y1, x2, y2]);
    
    // Position the overlay
    linkElement.style.position = 'absolute';
    linkElement.style.left = `${Math.min(canvasRect[0], canvasRect[2])}px`;
    linkElement.style.top = `${Math.min(canvasRect[1], canvasRect[3])}px`;
    linkElement.style.width = `${Math.abs(canvasRect[2] - canvasRect[0])}px`;
    linkElement.style.height = `${Math.abs(canvasRect[3] - canvasRect[1])}px`;
    linkElement.style.zIndex = '10';
    linkElement.style.background = 'transparent';
    linkElement.style.border = 'none';
    
    // Make the canvas container relative if it isn't already
    if (!canvas.parentNode.style.position) {
      canvas.parentNode.style.position = 'relative';
    }
    
    canvas.parentNode.appendChild(linkElement);
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      pdfDoc.getPage(num).then(page => {
          if (!pageRendering) renderPage(num);
      });
    } else {
      renderPage(num);
    }
  };

  const onPrevPage = () => {
    if (currentPage <= 1) return;
      queueRenderPage(currentPage - 1);
  };

  const onNextPage = () => {
    if (!pdfDoc || currentPage >= pageCount) return;
      queueRenderPage(currentPage + 1);
  };

  const onZoomIn = () => {
    if (scale <= maxScale) {
      scale += 0.1;
      queueRenderPage(pageNum);
    }
  };

  const onZoomOut = () => {
    if (scale >= minScale) {
      scale -= 0.1;
      queueRenderPage(pageNum);
    }
  };

  const printPdf = (url) => {
    onPrint(url);
  };

  const clockwiseRotate = () => {
    rotation += 90;
    queueRenderPage(pageNum);
  };

  const antiClockwiseRotate = () => {
    rotation -= 90;
    queueRenderPage(pageNum);
  };

  const onPasswordSubmit = () => {
    initialLoad();
  };

  const initialLoad = async () => {
    try {
      const loadingTask = pdfjs.getDocument({
        ...(url && { url }),
        ...(data && { data }),
        ...(password && { password }),
      });
      loadingTask.onProgress = onProgress;

      pdfDoc = await loadingTask.promise;
      passwordError = false;
      await tick();

      pageCount = pdfDoc.numPages;
      totalPage = pdfDoc.numPages;

      if (showButtons.includes('pageInfo')) {
        for (let number = 1; number <= totalPage; number++) {
          const textPage = await getPageText(number, pdfDoc);
          pdfContent += textPage;
          readingTime = calcRT(pdfContent);
        }
      }

      isInitialized = true;
      renderPage(currentPage);
    } catch (error) {
      passwordError = true;
      passwordMessage = error.message;
    }
  };

  initialLoad();

  // $: if (isInitialized) queueRenderPage(pageNum);

  const onPageTurn = () => {
    autoFlip = !autoFlip;
    clearInterval(interval);
    clearInterval(secondInterval);

    if (autoFlip && pageNum <= totalPage) {
      seconds = flipTime; // Reset seconds immediately
      secondInterval = setInterval(() => {
        seconds--;
      }, 1000);

      interval = setInterval(() => {
        clearInterval(secondInterval); // Clear the seconds counter interval
        seconds = flipTime; // Reset seconds *before* going to the next page
        onNextPage();
        if (currentPage > totalPage){
            onPageTurn();
        } else {
            secondInterval = setInterval(() => {
                seconds--;
            }, 1000);
        }
      }, flipTime * 1000);
    }
  };

  const downloadPdf = ({ url: fileUrl, data }) => {
    const fileName = downloadFileName || (fileUrl && fileUrl.substring(fileUrl.lastIndexOf('/') + 1)) || 'download.pdf'; // Provide a default file name
    savePDF({ fileUrl, data, name: fileName });
  };

  onDestroy(() => {
    clearInterval(interval);
    clearInterval(secondInterval);
  });

  let pageWidth;
  let pageHeight;
</script>

<svelte:window bind:innerWidth={pageWidth} bind:innerHeight={pageHeight} />

<div class="parent">
  <div class={showBorder === true ? 'control' : 'null'}>
    {#if passwordError === true}
      <div class="password-viewer">
        <p>This document requires a password to open:</p>
        <p class="password-message">{passwordMessage}</p>
        <div class="password-container">
          <input type="password" class="password-input" bind:value={password} />
          <button on:click={onPasswordSubmit} class="password-button">
            Submit
          </button>
        </div>
      </div>
    {:else if showButtons.length}
      <div class="control-start">
        <div class="line">
          {#if showButtons.includes('navigation')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control {pageNum <= 1 ? 'disabled' : null}"
                on:click={() => onPrevPage()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <polygon
                    points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485
                  18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9"
                  />
                </svg>
              </span>
              Previous
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control {pageNum >= totalPage
                  ? 'disabled'
                  : null}"
                on:click={() => onNextPage()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <polygon
                    points="16.172 9 10.101 2.929 11.515 1.515 20 10 19.293 10.707
                  11.515 18.485 10.101 17.071 16.172 11 0 11 0 9"
                  />
                </svg>
              </span>
              Next
            </Tooltip>
          {/if}
          {#if showButtons.includes('zoom')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control {scale >= maxScale ? 'disabled' : null}"
                on:click={() => onZoomIn()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42
                  1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7
                  7V5h2v2h2v2H9v2H7V9H5V7h2z"
                  />
                </svg>
              </span>
              Zoom In
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control {scale <= minScale ? 'disabled' : null}"
                on:click={() => onZoomOut()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42
                  1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM5
                  7h6v2H5V7z"
                  />
                </svg>
              </span>
              Zoom Out
            </Tooltip>
          {/if}
          {#if showButtons.includes('print')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control"
                on:click={() => printPdf(url)}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M4 16H0V6h20v10h-4v4H4v-4zm2-4v6h8v-6H6zM4 0h12v5H4V0zM2
                  8v2h2V8H2zm4 0v2h2V8H6z"
                  />
                </svg>
              </span>
              Print
            </Tooltip>
          {/if}
          {#if showButtons.includes('rotate')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control"
                on:click={() => antiClockwiseRotate()}
                on:keydown
              >
                <svg
                  class="icon rot-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42
                  1.42zM12 10h8l-4 4-4-4z"
                  />
                </svg>
              </span>
              Anti-Clockwise
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control"
                on:click={() => clockwiseRotate()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42
                  1.42zM12 10h8l-4 4-4-4z"
                  />
                </svg>
              </span>
              Clockwise
            </Tooltip>
          {/if}
          {#if showButtons.includes('download')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="button-control"
                on:click={() => downloadPdf({ url, data })}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                </svg>
              </span>
              Download
            </Tooltip>
          {/if}
          {#if showButtons.includes('autoflip')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="activator"
                class="page-info button-control"
                on:click={() => onPageTurn()}
                on:keydown
              >
                <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  {#if autoFlip === true}
                    <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                  {:else}
                    <path
                      d="M9.896,3.838L0.792,1.562v14.794l9.104,2.276L19,16.356V1.562L9.896,3.838z
                    M9.327,17.332L1.93,15.219V3.27 l7.397,1.585V17.332z
                    M17.862,15.219l-7.397,2.113V4.855l7.397-1.585V15.219z"
                    />
                  {/if}
                </svg>
              </span>
              {autoFlip === true ? seconds : 'Auto Turn Page'}
            </Tooltip>
          {/if}
          <span
            class="page-info"
            style={showButtons.includes('timeInfo') ? '' : 'display: none;'}
          >
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                d="M16.32 7.1A8 8 0 1 1 9 4.06V2h2v2.06c1.46.18 2.8.76 3.9
                1.62l1.46-1.46 1.42 1.42-1.46 1.45zM10 18a6 6 0 1 0 0-12 6 6 0 0
                0 0 12zM7 0h6v2H7V0zm5.12 8.46l1.42 1.42L10 13.4 8.59
                12l3.53-3.54z"
              />
            </svg>
            <span class="text">{readingTime} min read</span>
          </span>
          <span
            class="page-info"
            style={showButtons.includes('pageInfo') ? '' : 'display: none;'}
          >
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                d="M16 2h4v15a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V0h16v2zm0 2v13a1 1 0
                0 0 1 1 1 1 0 0 0 1-1V4h-2zM2 2v15a1 1 0 0 0 1 1h11.17a2.98 2.98
                0 0 1-.17-1V2H2zm2 8h8v2H4v-2zm0 4h8v2H4v-2zM4 4h8v4H4V4z"
              />
            </svg>
            <div class="text">
              Page : {currentPage} / {pageCount}
            </div>
          </span>
        </div>
        <div class={showBorder === true ? 'viewer' : 'null'}>
          <canvas bind:this={canvas} width={pageWidth} height={pageHeight}></canvas>
        </div>
      </div>
    {:else}
      <div class={showBorder === true ? 'viewer' : 'null'}>
        <canvas bind:this={canvas}></canvas>
        <!-- width={window.innerWidth} -->
        <!-- height={window.innerHeight}  -->
      </div>
    {/if}
  </div>
  {#if showTopButton}
    <button id="topBtn" on:click={() => window.scrollTo(0, 0)} aria-label="Back to Top">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M7 10v8h6v-8h5l-8-8-8 8h5z" />
      </svg>
    </button>
  {/if}
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  .parent {
    display: flex;
    flex-direction: column;
    margin: 0 1.25rem;
  }

  .password-viewer {
    border-width: 1px;
    border-color: #000;
    border-style: solid;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    widows: 100%;
  }

  .password-message {
    color: red;
    margin: 8px 0px;
  }

  .password-container {
    align-items: center;
    display: flex;
    justify-content: center;
    margin: 8px 0px;
  }

  .password-input {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 8px;
    width: 200px;
  }

  .password-button {
    background-color: rgb(53, 126, 221);
    border: 1px solid rgba(0, 0, 0, 0.2);
    color: rgb(255, 255, 255);
    border-left-color: transparent;
    cursor: pointer;
    padding: 8px 16px;
  }

  .control {
    margin-top: 1.25rem;
    margin-bottom: 0;
    margin-right: 2.5rem;
    margin-left: 2.5rem;
    border-radius: 0.25rem;
    overflow: auto;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    background-color: #fff;
    border-width: 1px;
  }

  .control-start {
    padding: 1.25rem;
  }

  .line {
    display: flex;
    flex-direction: row;
    font-family: Georgia, Cambria, "Times New Roman", Times, serif;
    border-top-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 1px;
    border-left-width: 0px;
    border-color: #4fd1c5;
    border-style: dotted;
    margin-bottom: 0.75rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    justify-content: center;
  }

  .button-control {
    display: flex;
    flex-direction: row;
    padding: 0.5rem;
    margin: 0.75rem;
    border-radius: 0.25rem;
    overflow: hidden;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-left-width: 1px;
    border-bottom-width: 1px;
    border-right-width: 1px;
    cursor: pointer;
  }

  .viewer {
    border-width: 1px;
    border-color: #000;
    border-style: solid;
  }

  .icon {
    height: 1.25rem;
    width: 1.25rem;
    fill: currentColor;
    color: #38b2ac;
  }

  .disabled {
    cursor: not-allowed;
    box-shadow: none;
  }

  .page-info {
    display: flex;
    flex-direction: row;
    padding-top: 0.5rem;
    margin: 0.75rem;
    overflow: hidden;
  }

  .text {
    margin-left: 0.5rem;
    cursor: default;
  }

  .rot-icon {
    transform: scaleX(-1);
  }

#topBtn {
    position: fixed;
    bottom: 10px;
    float: right;
    right: 10%;
    left: 90%;
    max-width: 30px;
    width: 100%;
    border-color: #000;
    background-color: #fff;
    padding: 0.5px;
    border-radius: 9999px;
  }

#topBtn:hover {
    background-color: #000;
    color: #fff;
  }

  /* 
    ##Device = Tablets, Ipads (portrait)
    ##Screen = B/w 768px to 1024px
    */

  @media (min-width: 768px) and (max-width: 1024px) {
    .parent {
      margin: 0;
    }

    .control {
      margin: 0;
    }

    .control-start {
      padding: 0;
    }

    .line {
      justify-content: center;
    }

    .button-control {
      display: flex;
      flex-direction: row;
      padding: 0.5rem;
      margin: 0.5rem;
      border-radius: 0.25rem;
      overflow: hidden;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-right-width: 1px;
      cursor: pointer;
    }

    .page-info {
      display: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  }

  /* 
    ##Device = Low Resolution Tablets, Mobiles (Landscape)
    ##Screen = B/w 481px to 767px
    */

  @media (min-width: 481px) and (max-width: 767px) {
    .parent {
      margin: 0;
    }

    .control {
      margin: 0;
    }

    .control-start {
      padding: 0;
    }

    .line {
      justify-content: center;
    }

    .button-control {
      display: flex;
      flex-direction: row;
      padding: 0.5rem;
      margin: 0.5rem;
      border-radius: 0.25rem;
      overflow: hidden;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-right-width: 1px;
      cursor: pointer;
    }

    .page-info {
      display: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  }

  /* 
    ##Device = Most of the Smartphones Mobiles (Portrait)
    ##Screen = B/w 320px to 479px
    */

  @media (min-width: 320px) and (max-width: 480px) {
    .parent {
      margin: 0;
    }

    .control {
      margin: 0;
    }

    .control-start {
      padding: 0;
    }

    .line {
      justify-content: center;
    }

    .button-control {
      display: flex;
      flex-direction: row;
      padding: 0.4rem;
      margin: 0.4rem;
      border-radius: 0.25rem;
      overflow: hidden;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-right-width: 1px;
      cursor: pointer;
    }

    .page-info {
      display: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  }

  :global(.pdf-link-overlay) {
    cursor: pointer;
    text-decoration: none;
  }
  
  :global(.pdf-link-overlay:hover) {
    background-color: rgba(0, 123, 255, 0.1) !important;
  }
</style>
