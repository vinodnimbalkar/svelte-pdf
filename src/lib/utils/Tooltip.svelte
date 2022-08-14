<script>
  import { scale, fade } from "svelte/transition";
  import { ClassBuilder } from "./classes.js";
  const classesDefault = "tooltip";
  let className = "";
  export let classes = classesDefault;
  export { className as class };
  export let show = false;
  export let timeout = null;
  const cb = new ClassBuilder(classes, classesDefault);
  $: c = cb
    .flush()
    .add(classes, true, classesDefault)
    .add(className)
    .get();
  function showTooltip() {
    if (show) return;
    show = true;
    if (!timeout) return;
    timeout = setTimeout(() => {
      show = false;
    }, timeout);
  }
  function hideTooltip() {
    if (!show) return;

    show = false;
    clearTimeout(timeout);
  }
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      let context = this,
        args = arguments;
      let later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
</script>

<style>
  .tooltip {
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.75rem;
    position: absolute;
    margin-top: 0.5rem;
    background-color: #718096;
    color: #fff;
    border-radius: 0.25rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    z-index: 30;
  }
  .activator {
    position: relative;
    display: inline-block;
  }
</style>

<div class="activator">
  <div
    on:mouseenter={debounce(showTooltip, 100)}
    on:mouseleave={debounce(hideTooltip, 500)}
    on:mouseenter
    on:mouseleave
    on:focus
    on:blur>
    <slot name="activator" />
  </div>

  {#if show}
    <div
      in:scale={{ duration: 150 }}
      out:scale={{ duration: 150, delay: 100 }}
      class={c}>
      <slot />
    </div>
  {/if}
</div>
