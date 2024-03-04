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

<style>@import "material-icons/iconfont/outlined.css";:root{--pw-color:red;--pw-btn-color:#357edd;--pw-txt-color:#fff;--icon-color:#38b2ac}div.parent[data-theme=dark]{--border-color:#efeff0;--control-background-color:#1a1c29;--background-color:#121212;--line-border-color:#36ebff;--viewer-border-color:#1a1c29}div.parent[data-theme=light]{--border-color:rgba(0,0,0,.2);--control-background-color:#fff;--line-border-color:#4fd1c5;--viewer-border-color:#000}:global(html){scroll-behavior:smooth}.parent{margin:0 1.25rem}.parent,.password-viewer{display:flex;flex-direction:column}.password-viewer{align-items:center;border-color:var(--border-color);border-style:solid;border-width:1px;height:100%;justify-content:center;widows:100%}.password-message{color:var(--pw-color);margin:8px 0}.password-container{align-items:center;display:flex;justify-content:center;margin:8px 0}.password-input{padding:8px;width:200px}.password-button,.password-input{border:1px solid var(--border-color)}.password-button{background-color:var(--pw-btn-color);border-left:1px solid transparent;color:var(--pw-txt-color);cursor:pointer;padding:8px 16px}.control{background-color:var(--control-background-color);border-radius:.25rem;border-width:1px;margin:.25rem 2.5rem 0;overflow:auto}.control-start{padding:1.25rem}.menu_bar{border-color:var(--line-border-color);border-style:solid;border-width:0 0 1px;font-family:montserrat,sans-serif;justify-content:center;margin-bottom:.1rem;padding-bottom:.1rem;padding-top:.1rem}.button-control,.menu_bar{display:flex;flex-direction:row}.button-control{cursor:pointer;margin:.7rem;overflow:hidden;padding:.3rem}.button-control:hover{transform:scale(1.5)}.viewer{border-color:var(--viewer-border-color);border-style:solid;border-width:1px}.disabled{color:#d3d3d3;cursor:not-allowed}.disabled:hover{transform:scale(1)}.page-info{color:var(--icon-color);display:flex;flex-direction:row;margin:.75rem;overflow:hidden;padding-top:.5rem}.text{cursor:default;margin-left:.5rem}#topBtn{background-color:var(--background-color);bottom:10px;color:var(--icon-color);float:right;font-size:2em;left:90%;max-width:30px;padding:.5px;position:fixed;right:10%;width:200%}#topBtn:hover{transform:scale(1.5)}@media (min-width:768px) and (max-width:1024px){.control,.parent{margin:0}.control-start{padding:0}.button-control{margin:.5rem}.page-info{display:none}canvas{height:100%;width:100%}}@media (min-width:481px) and (max-width:767px){.control,.parent{margin:0}.control-start{padding:0}.button-control{margin:.5rem}.page-info{display:none}canvas{height:100%;width:100%}}@media (min-width:320px) and (max-width:480px){.control,.parent{margin:0}.control-start{padding:0}.button-control{margin:.4rem;padding:.4rem}.page-info{display:none}canvas{height:100%;width:100%}}</style>
