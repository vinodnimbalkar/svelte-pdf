<script>
    import PdfViewer from '$lib/PdfViewer.svelte';
</script>

<!-- Default behavior (opens in new tab) -->
<PdfViewer url='./sample.pdf' />

<!-- Explicitly set to open in new tab -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_blank" />

<!-- Open in same tab -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_self" />

<!-- Open in parent frame -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_parent" />