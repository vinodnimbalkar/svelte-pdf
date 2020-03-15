<script>
  import pdfjs from "pdfjs-dist";
  import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

  export let url;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  let canvas;
  let prev;
  let next;
  let page_num;
  let pageCount;
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.8;
  let rotation = 0;

  const renderPage = num => {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(page => {
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
  //Rotate Clockwise
  const clockwiseRotate = () => {
    rotation = rotation + 90;
    queueRenderPage(pageNum);
  };
  // Rotate Anti-Clockwise
  const antiClockwiseRotate = () => {
    rotation = rotation - 90;
    queueRenderPage(pageNum);
  };

  let loadingTask = pdfjs.getDocument(url);
  loadingTask.promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    pageCount.textContent = pdfDoc.numPages;
    // Initial/first page rendering
    renderPage(pageNum);
  });
</script>
