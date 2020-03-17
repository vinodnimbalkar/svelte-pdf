
# svelte-pdf

Simple svelte PDF Viewer component with controls like

-   Page navigation
-   Zoom
-	Rotation
-	Print

## How to install

```
npm install svelte-pdf
```

## How to use

```js
<script>
	import PdfViewer from 'svelte-pdf';
</script>

<PdfViewer url='helloworld.pdf' />

```

## Props

prop name            | type                   | default
---------------------|------------------------|-------------------------
`url`              | `string`                 | `""`
`scale`            | `float`                  | `1.8`
`pageNum`          | `number`                 | `1`
