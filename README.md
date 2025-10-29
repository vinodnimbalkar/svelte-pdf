# svelte-pdf (Enhanced Fork)

> **🎉 This is an adapted and improved version of the original [svelte-pdf](https://github.com/vinodnimbalkar/svelte-pdf) by [Vinod Nimbalkar](https://github.com/vinodnimbalkar).**

## What's Different?

This fork provides several enhancements over the original package:

### ✨ Key Improvements

- **🚀 Svelte 5 Support** - Fully compatible with the latest Svelte 5
- **📦 GitHub Installation Ready** - Install directly from GitHub without publishing to npm
- **🔧 Modern Build System** - Updated to use SvelteKit 2 and latest tooling
- **📝 TypeScript Definitions** - Improved type definitions for better DX
- **🔄 Both Import Styles** - Supports both default and named imports
- **🛠️ Better Developer Experience** - Auto-build on install with `prepare` script

### 🙏 Credits

All credit for the original implementation goes to [Vinod Nimbalkar](https://github.com/vinodnimbalkar). This fork simply modernizes the package and makes it easier to use as a GitHub dependency.

---

## About

A simple, powerful Svelte PDF Viewer component with built-in controls:

- 📄 Page navigation
- 🔍 Zoom controls
- 🔄 Rotation
- 🖨️ Print functionality
- ⏱️ AutoFlip Page
- 🔗 External link handling

## Demo

Check out the original demo: https://svelte-pdf.vinversion.com

## Installation

### From GitHub (Recommended for this fork)

This enhanced version is designed to be installed directly from GitHub:

```bash
# Install from your GitHub repository
npm install github:TommasoPrinetti/svelte-pdf

# Or install from a specific branch
npm install github:TommasoPrinetti/svelte-pdf#master

# Or install from a specific commit/tag
npm install github:TommasoPrinetti/svelte-pdf#v2.0.0
```

**✨ What happens during installation:**

- The package automatically builds itself using the `prepare` script
- The `dist` folder is generated with all necessary files
- No manual build steps required!

### From Original npm Package

To use the original version (without Svelte 5 support):

```bash
npm install svelte-pdf
```

**Note:** The original npm package may not work with Svelte 5. Use this GitHub fork for Svelte 5 projects.

## Usage

### Import Styles

This fork supports both default and named imports:

```js
// Default import (original style)
import PdfViewer from "svelte-pdf";

// Named import (also supported)
import { PdfViewer } from "svelte-pdf";
```

### Basic Examples

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

#### Monitoring loading progress

For large PDFs, you can monitor the loading progress using the `onProgress` callback:

```js
<script>
    import PdfViewer from 'svelte-pdf';

  function handleProgress(data) {
    const { loaded, total } = data;
    console.log(`Loading: ${Math.round((loaded / total) * 100)}%`);
    // You could update a progress bar or other UI element here
  }
</script>

<PdfViewer url='./large-sample.pdf' onProgress={handleProgress} />
```

#### Controlling external links behavior

You can control how external links within the PDF open using the `externalLinksTarget` prop:

```js
<script>
    import PdfViewer from 'svelte-pdf';
</script>

<!-- Open links in new tab (default) -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_blank" />

<!-- Open links in same tab -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_self" />

<!-- Open links in parent frame -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_parent" />

<!-- Open links in top-level frame -->
<PdfViewer url='./sample.pdf' externalLinksTarget="_top" />
```

## Props

| prop name             | type       | default                                                                                     |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `url`                 | `string`   | `N/A`                                                                                       |
| `data`                | `string`   | `N/A`                                                                                       |
| `scale`               | `float`    | `1.8`                                                                                       |
| `pageNum`             | `number`   | `1`                                                                                         |
| `flipTime`            | `number`   | `120`                                                                                       |
| `showButtons`         | `array`    | `["navigation", "zoom", "print", "rotate", "download", "autoflip", "timeInfo", "pageInfo"]` |
| `showBorder`          | `boolean`  | `true`                                                                                      |
| `downloadFileName`    | `string`   | `N/A`                                                                                       |
| `onProgress`          | `function` | `undefined`                                                                                 |
| `externalLinksTarget` | `string`   | `"_blank"`                                                                                  |

## Running the Demo

To view the examples locally:

```bash
# Clone this repository
git clone https://github.com/TommasoPrinetti/svelte-pdf.git
cd svelte-pdf

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Then open your browser to the URL shown in the terminal (typically http://localhost:5173).

## SvelteKit SSR Compatibility

Since the `PdfViewer` component depends on browser APIs (`window` object), you need to handle it properly in SvelteKit:

### Option 1: Dynamic Import (Recommended)

```svelte
<script>
  import { onMount } from "svelte";
  import { browser } from '$app/environment';

  let PdfViewer;

  onMount(async () => {
    const module = await import("svelte-pdf");
    PdfViewer = module.default;
  });
</script>

{#if browser && PdfViewer}
  <svelte:component this={PdfViewer} url="YOUR-PDF-URL" />
{:else}
  <p>Loading PDF viewer...</p>
{/if}
```

### Option 2: Client-Only Import

```svelte
<script>
  import PdfViewer from 'svelte-pdf';
</script>

<svelte:component this={PdfViewer} url="YOUR-PDF-URL" />
```

Then in your `+page.js` or `+layout.js`:

```js
export const ssr = false;
```

## Development

### Building the Package

```bash
npm run package
```

This generates the `dist` folder with the compiled library.

### Running Tests

```bash
npm run check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For bug reports or feature requests related to the core functionality, please consider contributing to the [original repository](https://github.com/vinodnimbalkar/svelte-pdf).

For issues specific to this fork (Svelte 5 compatibility, GitHub installation, etc.), please open an issue in this repository.

## Acknowledgments

**Original Package:** [svelte-pdf](https://github.com/vinodnimbalkar/svelte-pdf) by [Vinod Nimbalkar](https://github.com/vinodnimbalkar)

This fork maintains the spirit and functionality of the original while modernizing it for current Svelte ecosystem standards.

## License

**MIT License**

Original work &copy; [Vinod Nimbalkar](https://github.com/vinodnimbalkar)  
Modified work &copy; 2025 - This Fork

See [LICENSE](LICENSE) file for details.
