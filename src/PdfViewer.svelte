<script>
  import pdfjs from "pdfjs-dist";
  import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
  import printJS from "print-js";
  import Tooltip from "./utils/Tooltip.svelte";
  import Tailwindcss from "./Tailwindcss.svelte";

  export let url;
  export let scale = 1.8;
  export let pageNum = 1; //must be number

  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  let canvas;
  let prev;
  let next;
  let page_num;
  let pageCount;
  let pdfDoc = null;
  let pageRendering = false;
  let pageNumPending = null;
  let rotation = 0;

  const renderPage = num => {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      let viewport = page.getViewport({ scale: scale, rotation: rotation });
      const canvasContext = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      let renderContext = {
        canvasContext,
        viewport
      };
      let renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    page_num.textContent = num;
  };

  const queueRenderPage = num => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  /**
   * Displays previous page.
   */
  const onPrevPage = () => {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  };

  /**
   * Displays next page.
   */
  const onNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  };
  /*
   * Display Zoom In
   */
  const onZoomIn = () => {
    if (scale <= 2.3) {
      scale = scale + 0.1;
      queueRenderPage(pageNum);
    }
  };
  /*
   * Display Zoom Out
   */
  const onZoomOut = () => {
    if (scale >= 1.0) {
      scale = scale - 0.1;
      queueRenderPage(pageNum);
    }
  };

  const printPdf = url => {
    printJS({ printable: url, type: "pdf" });
  };

  const clockwiseRotate = () => {
    rotation = rotation + 90;
    queueRenderPage(pageNum);
  };

  const antiClockwiseRotate = () => {
    rotation = rotation - 90;
    queueRenderPage(pageNum);
  };

  /**
   * Asynchronously downloads PDF.
   */

  let loadingTask = pdfjs.getDocument(url);
  loadingTask.promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    pageCount.textContent = pdfDoc.numPages;
    // Initial/first page rendering
    console.log(typeof pageNum);
    renderPage(pageNum);
  });
</script>

<style>
  .rot {
    transform: rotate(180deg);
  }
</style>

<Tailwindcss />
<div class="flex flex-col mx-5">
  <div
    class="mx-10 mt-5 rounded overflow-auto h-screen shadow-lg bg-white border
    headnote-scroll">
    <div class="p-5">
      <div
        class="flex flex-row font-serif border-b border-teal-400 border-dotted
        mb-3 py-2 headnote-helper">
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded overflow-hidden shadow-lg
            border-l border-b border-r cursor-pointer"
            bind:this={prev}
            on:click={() => onPrevPage()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <polygon
                points="3.828 9 9.899 2.929 8.485 1.515 0 10 .707 10.707 8.485
                18.485 9.899 17.071 3.828 11 20 11 20 9 3.828 9" />
            </svg>
          </span>
          Prevoius
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded overflow-hidden shadow-lg
            border-l border-b border-r cursor-pointer"
            bind:this={next}
            on:click={() => onNextPage()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <polygon
                points="16.172 9 10.101 2.929 11.515 1.515 20 10 19.293 10.707
                11.515 18.485 10.101 17.071 16.172 11 0 11 0 9" />
            </svg>
          </span>
          Next
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded overflow-hidden shadow-lg
            border-l border-b border-r cursor-pointer"
            on:click={() => onZoomIn()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42
                1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7
                7V5h2v2h2v2H9v2H7V9H5V7h2z" />
            </svg>
          </span>
          Zoom In
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded overflow-hidden shadow-lg
            border-l border-b border-r cursor-pointer"
            on:click={() => onZoomOut()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42
                1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM5 7h6v2H5V7z" />
            </svg>
          </span>
          Zoom Out
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded shadow-lg border-l border-b
            border-r cursor-pointer"
            on:click={() => printPdf(url)}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                d="M4 16H0V6h20v10h-4v4H4v-4zm2-4v6h8v-6H6zM4 0h12v5H4V0zM2
                8v2h2V8H2zm4 0v2h2V8H6z" />
            </svg>
          </span>
          Print
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded shadow-lg border-l border-b
            border-r cursor-pointer"
            on:click={() => antiClockwiseRotate()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500 rot"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42
                1.42zM12 10h8l-4 4-4-4z" />
            </svg>
          </span>
          Anti-Clockwise
        </Tooltip>
        <Tooltip>
          <span
            slot="activator"
            class="flex flex-row p-2 mx-3 rounded shadow-lg border-l border-b
            border-r cursor-pointer"
            on:click={() => clockwiseRotate()}>
            <svg
              class="h-5 w-5 mx-2 fill-current text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42
                1.42zM12 10h8l-4 4-4-4z" />
            </svg>
          </span>
          Clockwise
        </Tooltip>
        <span class="flex flex-row p-2 mx-3">
          Page :
          <span bind:this={page_num} />
          /
          <span bind:this={pageCount} />
        </span>
      </div>
      <div class="border border-black border-solid">
        <canvas
          bind:this={canvas}
          width={window.innerWidth}
          height={window.innerHeight} />
      </div>
    </div>
  </div>
</div>
