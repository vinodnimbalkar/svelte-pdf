<script>
  // @ts-nocheck

  import PdfViewer from '$lib/PdfViewer.svelte'
</script>

<PdfViewer
  url="https://raw.githubusercontent.com/vinodnimbalkar/svelte-pdf/369db2f9edbf5ab8c87184193e1404340729bb3a/public/sample.pdf"
  mode="dark"
  showbuttons="['navigation', 'zoom', 'print', 'rotate', 'download', 'autoflip', 'timeInfo', 'pageInfo']"
/>
