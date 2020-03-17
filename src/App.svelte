<script>
  import axios from "axios";
  import PdfViewer from "./PdfViewer.svelte";

  const callPdf = async () => {
    let response = await axios(
      "https://nearlaw.com/PDF/MumbaiHC/2018/2018(7)-ALL-MR-95.pdf",
      {
        method: "GET",
        responseType: "blob" //Force to receive data in a Blob Format
      }
    );
    //Create a Blob from the PDF Stream
    const file = new Blob([response.data], { type: "application/pdf" });
    //Build a URL from the file
    const fileURL = URL.createObjectURL(file);
    return fileURL;
  };

  const src = callPdf();
</script>

{#await src}
  <p>Loading...</p>
{:then url}
  <PdfViewer {url} />
{/await}
