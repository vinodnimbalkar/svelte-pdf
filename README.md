
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

## Examples

To view the examples, clone the **svelte-pdf** repo and install the dependencies:

```bash
$ git clone https://github.com/vinodnimbalkar/svelte-pdf.git
$ cd example
$ npm install
$ npm run dev
```

Then run the **http://localhost:5000**:


## Contributing

Feel free to open an issue (or even better, send a Pull Request). Contributions are very welcome!! 😄


## License

**MIT &copy; [Vinod Nimbalkar](https://github.com/vinodnimbalkar/svelte-pdf/blob/master/LICENSE)**