# svelte-pdf

[![MadeWithSvelte.com shield](https://madewithsvelte.com/storage/repo-shields/2346-shield.svg)](https://madewithsvelte.com/p/svelte-pdf/shield-link)
![npm](https://img.shields.io/npm/dw/svelte-pdf?style=flat-square)
![npm](https://img.shields.io/npm/v/svelte-pdf?style=flat-square)

Simple svelte PDF Viewer component with controls like

- Page navigation
- Zoom
- Rotation
- Print
- AutoFlip Page

## Demo

Source code of demo page is included in example directory.

https://svelte-pdf.netlify.com

## How to install

```
npm install svelte-pdf
```

## How to use

```js
<script>
	import PdfViewer from 'svelte-pdf';
</script>

<PdfViewer url='./helloworld.pdf' />

```

## Props

| prop name     | type      | default | Required |
| ------------- | --------- | ------- | -------- |
| `url`         | `string`  | `""`    | `Yes`    |
| `scale`       | `float`   | `1.8`   | `No`     |
| `pageNum`     | `number`  | `1`     | `No`     |
| `flipTime`    | `number`  | `120`   | `No`     |
| `showButtons` | `boolean` | `true`  | `No`     |
| `showBorder`  | `boolean` | `true`  | `No`     |

## Examples

To view the examples, clone the **svelte-pdf** repo and install the dependencies:

```bash
$ git clone https://github.com/vinodnimbalkar/svelte-pdf.git
$ cd example
$ npm install
$ npm run dev
```

Then run the **http://localhost:5000**:

## How to use it in Sapper with SSR enabled

### 1. Install it as part of `devDependencies`

> When using Svelte components installed from npm, it needs the original component source (rather than any precompiled JavaScript that ships with the component). This allows the component to be rendered server-side, and also keeps your client-side app smaller...

      -- [Rich Harris](https://github.com/Rich-Harris/svelte-workshop#using-external-components)

We have to install `svelte-pdf` as part of `devDependencies`

```bash
npm install -D svelte-pdf
```

...this will cause it to get bundled (and therefore compiled) with your app.

### 2. Make our `PdfViewer` component SSR compatible

Since out `PdfViewer` component has a dependency on `window` object, we have to use dynamic import, from within the `onMount` function (which is only called on the client), so that our import code is never called on the server. [Refer to the official doc here...](https://sapper.svelte.dev/docs#Making_a_component_SSR_compatible)

```bash

<script>
  import { onMount } from "svelte";
  let PdfViewer;

  onMount(async () => {
    const module = await import("svelte-pdf");
    PdfViewer = module.default;
  });
</script>

<svelte:component this={PdfViewer} url="YOUR-PDF-URL"/>
```

## Contributing

Feel free to open an issue (or even better, send a Pull Request). Contributions are very welcome!! 😄

## License

**MIT &copy; [Vinod Nimbalkar](https://github.com/vinodnimbalkar/svelte-pdf/blob/master/LICENSE)**
