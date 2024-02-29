<script>
  import { scale } from 'svelte/transition'
  import { ClassBuilder } from './classes.js'
  const classesDefault = 'tooltip'
  let className = ''
  export let classes = classesDefault
  export { className as class }
  export let show = false

  export let timeout = null
  const cb = new ClassBuilder(classes, classesDefault)
  $: c = cb.flush().add(classes, true, classesDefault).add(className).get()
  function showTooltip() {
    if (show) return
    show = true
    if (!timeout) return
    timeout = setTimeout(() => {
      show = false
    }, timeout)
  }
  function hideTooltip() {
    if (!show) return

    show = false
    clearTimeout(timeout)
  }
  /**
   * @param {{ (): void; (): void; apply?: any; }} func
   * @param {number} wait milliseconds
   * @param {boolean} [immediate]
   */
  function debounce(func, wait, immediate) {
    /**
     * @type {number}
     */
    let timeout
    return function () {
      let context = this,
        args = arguments
      let later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      let callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }
</script>

<div class="activator">
  <div
    role="note"
    on:mouseenter={debounce(showTooltip, 100)}
    on:mouseleave={debounce(hideTooltip, 100)}
    on:mouseenter
    on:mouseleave
    on:focus
    on:blur
  >
    <slot name="activator" />
  </div>

  {#if show}
    <div
      in:scale={{ duration: 150 }}
      out:scale={{ duration: 150, delay: 100 }}
      class={c}
    >
      <slot />
    </div>
  {/if}
</div>

<style>.tooltip{background-color:#718096;border-radius:.25rem;color:#fff;font-size:.75rem;left:50%;margin-top:.5rem;padding:1rem .75rem;position:absolute;transform:translateX(-50%);white-space:nowrap;z-index:30}.activator{display:inline-block;position:relative}</style>
