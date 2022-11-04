<script>
  import { status } from "./store"
  import Loading from "./comps/Loading.svelte"
  import { slide } from "svelte/transition"

  let size = "15px"
  let err
  $: $status?.finally(() => (err = undefined)).catch((e) => (err = e))
</script>

<div class="container">
  <div class="status-container">
    {#await $status}
      <Loading {size} />
    {:then}
      <div class="status" style:width={size} style:height={size} />
    {:catch}
      <div class="status bad" style:width={size} style:height={size} />
    {/await}
  </div>

  {#if err}
    <div class="text-container" transition:slide>{err}</div>
  {/if}
</div>

<style>
  .status {
    background: green;
    border-radius: 99px;
  }
  .status.bad {
    background: red;
  }
  .container {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
  }
  .text-container,
  .status-container {
    padding: 10px;
    background-color: var(--button-base);
  }
  .text-container {
    min-width: 40px;
    border-radius: 20px 20px 0 0;
  }
  .status-container {
    margin: auto;
    width: fit-content;
    border-radius: 20px 20px 0 0;
  }
</style>
