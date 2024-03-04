<script>
  // @ts-nocheck

  import * as pdfjs from 'pdfjs-dist'
  import * as pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs'
  import { onDestroy, tick } from 'svelte'
  import { calcRT, getPageText, onPrint, savePDF } from './utils/Helper.svelte'
  import Tooltip from './utils/Tooltip.svelte'

  export let url
  export let data
  export let scale = 1.5
  export let mode = 'dark'
  export let pageNum = 1 //must be number
  export let flipTime = 120 //by default 2 minute, value in seconds
  export let showButtons = ['navigation', 'zoom', 'print', 'rotate', 'download', 'autoflip', 'timeInfo', 'pageInfo'] //array
  export let showBorder = true //boolean
  export let totalPage = 0
  export let downloadFileName = ''

  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

  let canvas
  let page_num = 0
  let pageCount = 0
  let pdfDoc = null
  let pageRendering = false
  let pageNumPending = null
  let rotation = 0
  let pdfContent = ''
  let readingTime = 0
  let autoFlip = false
  let interval
  let secondInterval
  let seconds = flipTime
  let pages = []
  let password = ''
  let passwordError = false
  let passwordMessage = ''
  let isInitialized = false
  const minScale = 1.0
  const maxScale = 2.3

  const renderPage = num => {
    pageRendering = true
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
      let viewport = page.getViewport({ scale: scale, rotation: rotation })
      const canvasContext = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page into canvas context
      let renderContext = {
        canvasContext,
        viewport,
      }
      let renderTask = page.render(renderContext)

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false
        if (pageNumPending !== null) {
          // New page rendering is pending
          // renderPage(pageNumPending);
          if (pageNum < pdfDoc.totalPage) {
            pages[pageNum] = canvas
            pageNum++
            pdfDoc.getPage(pageNum).then(renderPage)
          } else {
            for (let i = 1; i < pages.length; i++) {
              canvas.appendChild(pages[i])
            }
          }
          pageNumPending = null
        }
      })
    })

    // Update page counters
    showButtons.length ? (page_num.textContent = num) : null
  }

  const queueRenderPage = num => {
    if (pageRendering) {
      pageNumPending = num
    } else {
      renderPage(num)
    }
  }

  /**
   * Displays previous page.
   */
  const onPrevPage = () => {
    if (pageNum <= 1) {
      return
    }
    pageNum--
    queueRenderPage(pageNum)
  }

  /**
   * Displays next page.
   */
  const onNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
      return
    }
    pageNum++
    queueRenderPage(pageNum)
  }
  /*
   * Display Zoom In
   */
  const onZoomIn = () => {
    if (scale <= maxScale) {
      scale = scale + 0.1
      queueRenderPage(pageNum)
    }
  }
  /*
   * Display Zoom Out
   */
  const onZoomOut = () => {
    if (scale >= minScale) {
      scale = scale - 0.1
      queueRenderPage(pageNum)
    }
  }

  const printPdf = url => {
    onPrint(url)
  }

  const clockwiseRotate = () => {
    rotation = rotation + 90
    queueRenderPage(pageNum)
  }

  const antiClockwiseRotate = () => {
    rotation = rotation - 90
    queueRenderPage(pageNum)
  }

  const onPasswordSubmit = () => {
    initialLoad()
  }

  /**
   * Asynchronously downloads PDF.
   */

  const initialLoad = async () => {
    let loadingTask = pdfjs.getDocument({
      ...(url && { url }),
      ...(data && { data }),
      ...(password && { password }),
    })
    loadingTask.promise
      .then(async function (pdfDoc_) {
        pdfDoc = pdfDoc_
        passwordError = false
        await tick()

        showButtons.length ? (pageCount.textContent = pdfDoc.numPages) : null
        totalPage = pdfDoc.numPages
        if (showButtons.length) {
          for (let number = 1; number <= totalPage; number++) {
            // Extract the text
            getPageText(number, pdfDoc).then(function (textPage) {
              // Show the text of the page in the console
              pdfContent = pdfContent.concat(textPage)
              readingTime = calcRT(pdfContent)
            })
          }
        }
        isInitialized = true
      })
      .catch(function (error) {
        passwordError = true
        passwordMessage = error.message
      })
  }
  initialLoad()
  $: if (isInitialized) queueRenderPage(pageNum)

  //turn page after certain time interval
  const onPageTurn = () => {
    autoFlip = !autoFlip
    if (autoFlip === false) {
      clearInterval(interval) //stop autoflip
      clearInterval(secondInterval) //stop countdown seconds
    }
    if (autoFlip === true && pageNum <= totalPage) {
      //countdown seconds
      secondInterval = setInterval(() => {
        seconds = seconds - 1
      }, 1000)
      interval = setInterval(() => {
        seconds = flipTime //reset second after page flip
        onNextPage()
      }, flipTime * 1000) //every {flipTime} seconds
    }
  }
  //Download pdf function
  const downloadPdf = (fileURL, data) => {
    let fileName = downloadFileName || (fileURL && fileURL.substring(fileURL.lastIndexOf('/') + 1))

    savePDF(fileURL, data, fileName)
  }
  //prevent memory leak
  onDestroy(() => {
    clearInterval(interval)
    clearInterval(secondInterval)
  })

  let pageWidth
  let pageHeight
</script>

<svelte:window bind:innerWidth={pageWidth} bind:innerHeight={pageHeight} />
<div class="parent" data-theme={mode === 'dark' ? 'dark' : 'light'}>
  <div class={showBorder === true ? 'control' : 'null'}>
    {#if passwordError === true}
      <div class="password-viewer">
        <p>This document requires a password to open:</p>
        <p class="password-message">{passwordMessage}</p>
        <div class="password-container">
          <input type="password" class="password-input" bind:value={password} />
          <button on:click={onPasswordSubmit} class="password-button"> Submit </button>
        </div>
      </div>
    {:else if showButtons.length}
      <div class="control-start">
        <div class="menu_bar">
          {#if showButtons.includes('navigation')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control {pageNum <= 1 ? 'disabled' : null}"
                on:click={() => onPrevPage()}
                on:keydown
              >
                arrow_back
              </span>
              Previous
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control {pageNum >= totalPage ? 'disabled' : null}"
                on:click={() => onNextPage()}
                on:keydown
              >
                arrow_forward
              </span>
              Next
            </Tooltip>
          {/if}
          {#if showButtons.includes('zoom')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control {scale >= maxScale ? 'disabled' : null}"
                on:click={() => onZoomIn()}
                on:keydown
              >
                zoom_in
              </span>
              Zoom In
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control {scale <= minScale ? 'disabled' : null}"
                on:click={() => onZoomOut()}
                on:keydown
              >
                zoom_out
              </span>
              Zoom Out
            </Tooltip>
          {/if}
          {#if showButtons.includes('print')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control"
                on:click={() => {
                  printPdf(url)
                }}
                on:keydown
              >
                print
              </span>
              Print
            </Tooltip>
          {/if}
          {#if showButtons.includes('rotate')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control"
                on:click={() => antiClockwiseRotate()}
                on:keydown
              >
                rotate_left
              </span>
              Rotate Left
            </Tooltip>
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control"
                on:click={() => clockwiseRotate()}
                on:keydown
              >
                rotate_right
              </span>
              Rotate Right
            </Tooltip>
          {/if}
          {#if showButtons.includes('download')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined button-control"
                on:click={() => downloadPdf(url, data)}
                on:keydown
              >
                download
              </span>
              Download
            </Tooltip>
          {/if}
          {#if showButtons.includes('autoflip')}
            <Tooltip>
              <span
                role="button"
                tabindex="0"
                slot="icon-button"
                class="material-icons-outlined page-info button-control"
                on:click={() => onPageTurn()}
                on:keydown
              >
                {#if autoFlip === true}
                  description
                {:else}
                  auto_stories
                {/if}
              </span>
              {autoFlip === true ? `Next Page: ${seconds}` : 'Auto Turn Page'}
            </Tooltip>
          {/if}
          <span class="page-info" style={showButtons.includes('timeInfo') ? '' : 'display: none;'}>
            <span class="material-icons-outlined">schedule</span>

            <span class="text">{readingTime} min read</span>
          </span>
          <span class="page-info" style={showButtons.includes('pageInfo') ? '' : 'display: none;'}>
            <span class="material-icons-outlined"> pages </span>
            <div class="text">
              Page :
              <span bind:this={page_num} />
              /
              <span bind:this={pageCount} />
            </div>
          </span>
        </div>
        <div class={showBorder === true ? 'viewer' : 'null'}>
          <canvas bind:this={canvas} width={pageWidth} height={pageHeight} />
        </div>
      </div>
    {:else}
      <div class={showBorder === true ? 'viewer' : 'null'}>
        <canvas bind:this={canvas} />
        <!-- width={window.innerWidth} -->
        <!-- height={window.innerHeight}  -->
      </div>
    {/if}
  </div>
  <button id="topBtn" on:click={() => window.scrollTo(0, 0)}>
    <span class="material-icons-outlined"> arrow_upward </span>
  </button>
</div>

<style>
  @import 'material-icons/iconfont/outlined.css';

  :root {
    --pw-color: red;
    --pw-btn-color: rgb(53, 126, 221);
    --pw-txt-color: rgb(255, 255, 255);
    --icon-color: #38b2ac;
  }

  div.parent[data-theme='dark'] {
    --border-color: hsl(240, 3%, 94%);
    --control-background-color: #1a1c29;
    --background-color: #121212;
    --line-border-color: #36ebff;
    --viewer-border-color: #1a1c29;
  }

  div.parent[data-theme='light'] {
    --border-color: rgba(0, 0, 0, 0.2);
    --control-background-color: white;
    --line-border-color: #4fd1c5;
    --viewer-border-color: black;
  }

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
    border-color: var(--border-color);
    border-style: solid;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    widows: 100%;
  }

  .password-message {
    color: var(--pw-color);
    margin: 8px 0px;
  }

  .password-container {
    align-items: center;
    display: flex;
    justify-content: center;
    margin: 8px 0px;
  }

  .password-input {
    border: 1px solid var(--border-color);
    padding: 8px;
    width: 200px;
  }

  .password-button {
    background-color: var(--pw-btn-color);
    border: 1px solid var(--border-color);
    color: var(--pw-txt-color);
    border-left-color: transparent;
    cursor: pointer;
    padding: 8px 16px;
  }

  .control {
    margin-top: 0.25rem;
    margin-bottom: 0;
    margin-right: 2.5rem;
    margin-left: 2.5rem;
    border-radius: 0.25rem;
    overflow: auto;
    background-color: var(--control-background-color);
    border-width: 1px;
  }

  .control-start {
    padding: 1.25rem;
  }

  .menu_bar {
    display: flex;
    flex-direction: row;
    font-family: 'montserrat', sans-serif;
    border-top-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 1px;
    border-left-width: 0px;
    border-color: var(--line-border-color);
    border-style: solid;
    margin-bottom: 0.1rem;
    padding-top: 0.1rem;
    padding-bottom: 0.1rem;
    justify-content: center;
  }

  .button-control {
    display: flex;
    flex-direction: row;
    padding: 0.3rem;
    margin: 0.7rem;
    overflow: hidden;
    cursor: pointer;
  }

  .button-control:hover {
    transform: scale(1.5);
  }

  .viewer {
    border-width: 1px;
    border-color: var(--viewer-border-color);
    border-style: solid;
  }

  .disabled {
    cursor: not-allowed;
    color: lightgray;
  }

  .disabled:hover {
    transform: scale(1);
  }

  .page-info {
    display: flex;
    flex-direction: row;
    padding-top: 0.5rem;
    margin: 0.75rem;
    overflow: hidden;
    color: var(--icon-color);
  }

  .text {
    margin-left: 0.5rem;
    cursor: default;
  }

  #topBtn {
    position: fixed;
    bottom: 10px;
    float: right;
    right: 10%;
    left: 90%;
    max-width: 30px;
    width: 200%;
    font-size: 2em;
    color: var(--icon-color);
    background-color: var(--background-color);
    padding: 0.5px;
  }

  #topBtn:hover {
    transform: scale(1.5);
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

    .button-control {
      margin: 0.5rem;
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

    .button-control {
      margin: 0.5rem;
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

    .button-control {
      padding: 0.4rem;
      margin: 0.4rem;
    }

    .page-info {
      display: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  }
</style>
