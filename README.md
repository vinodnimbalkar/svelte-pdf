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

#### Using local path

```js
<script>
	import PdfViewer from 'svelte-pdf';
</script>

<PdfViewer url='./sample.pdf' />

```

#### Using url

```js
<script>
	import PdfViewer from 'svelte-pdf';
</script>

<PdfViewer url='https://raw.githubusercontent.com/vinodnimbalkar/svelte-pdf/369db2f9edbf5ab8c87184193e1404340729bb3a/public/sample.pdf' />

```

#### Using `base64` encoded string

```js
<script>
	import PdfViewer from 'svelte-pdf';
  const base64 =
    "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G";
</script>

<PdfViewer data={atob(base64)} />

```

## Props

| prop name     | type      | default | Required |
| ------------- | --------- | ------- | -------- |
| `url`         | `string`  | `N/A`   | `Yes`    |
| `data`        | `string`  | `N/A`   | `No`     |
| `scale`       | `float`   | `1.8`   | `No`     |
| `pageNum`     | `number`  | `1`     | `No`     |
| `flipTime`    | `number`  | `120`   | `No`     |
| `showButtons` | `array`   | `["navigation", "zoom", "print", "rotate", "download", "autoflip", "timeInfo", "pageInfo"]`  | `No`     |
| `showBorder`  | `boolean` | `true`  | `No`     |
| `downloadFileName` | `string` | `N/A` | `No`   |

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
