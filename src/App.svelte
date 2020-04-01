<script>
  import PdfViewer from "./PdfViewer.svelte";

  const src = "https://nearlaw.com/PDF/MumbaiHC/2018/2018(7)-ALL-MR-95.pdf";
</script>

{#await src}
  <p>Loading...</p>
{:then url}
  <PdfViewer {url} />
{/await}
