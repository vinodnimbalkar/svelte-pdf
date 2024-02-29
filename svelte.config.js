import adapter from '@sveltejs/adapter-auto'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
  preprocess: preprocess({
    postcss: {
      plugins: [autoprefixer(), cssnano()],
    },
  }),
}

export default config
