<script context="module">
  /**
   * Print entire pdf pages
   * @param {String} url pdf url
   * */
  export const onPrint = url => {
    let iframe
    if (!iframe) {
      iframe = document.createElement('iframe')
      document.body.appendChild(iframe)

      iframe.style.display = 'none'
      iframe.onload = function () {
        setTimeout(function () {
          iframe.focus()
          iframe.contentWindow.print()
        }, 1)
      }
    }

    iframe.src = url
  }
  /**
   * Calculate reading time of entire pdf document
   * @param {String} paraBody pdf text to calculate reading time
   * */
  export const calcRT = paraBody => {
    const wordsPerMinute = 200 // Average case.

    let textLength = paraBody.split(' ').length // Split by words
    if (textLength > 0) {
      return Math.ceil(textLength / wordsPerMinute)
    }
  }

  /**
   * Retrieves the text of a specif page within a PDF Document obtained through pdf.js
   *
   * @param {Integer} pageNum Specifies the number of the page
   * @param {PDFDocument} PDFDocumentInstance The PDF document obtained
   **/
  export const getPageText = (pageNum, PDFDocumentInstance) => {
    // Return a Promise that is solved once the text of the page is retrieving
    return new Promise(function (resolve, reject) {
      PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
        // The main trick to obtain the text of the PDF page, use the getTextContent method
        pdfPage.getTextContent().then(function (textContent) {
          var textItems = textContent.items
          var finalString = ''

          // Concatenate the string of the item to the final string
          for (var i = 0; i < textItems.length; i++) {
            var item = textItems[i]

            finalString += item.str + ' '
          }

          // Solve promise with the text retrieved from the page
          resolve(finalString)
        })
      })
    })
  }

  /**
   * Saves a PDF Blob as a file with the given name.
   *
   * @param {String} fileUrl - The PDF url to save.
   * @param {String} data - base64 decoded string
   * @param {string} name - The name to use for the saved file.
   */
  export const savePDF = async ({ fileUrl, data, name = 'download.pdf' }) => {
    const link = document.createElement('a')
    link.download = name
    link.rel = 'noopener'
    if (!fileUrl) {
      fileUrl = `data:application/pdf;base64,${btoa(data)}`
    }
    let blobs = await fetch(fileUrl).then(r => r.blob())
    if (!blobs || !(blobs instanceof Blob)) {
      console.log('Invalid blob object passed to URL.createObjectURL()')
    }
    if (typeof URL.createObjectURL === 'undefined') {
      console.log('Your browser does not support URL.createObjectURL()')
    }

    const url = URL.createObjectURL(blobs)
    link.href = url
    link.click()
    // Revoke the object URL to free up memory
    URL.revokeObjectURL(link.href)
  }
</script>
