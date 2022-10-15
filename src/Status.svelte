<script>
  import { status } from "./store"
  import Loading from "./comps/Loading.svelte"

  let size = "15px"
	
</script>

<div class="container">
  {#await $status}
    <div class="status-container">
      <Loading {size} />
    </div>
  {:then}
    <div class="status-container">
      <div class="status" style:width={size} style:height={size} />
    </div>
  {:catch err}
    <div class="status-container">
      <div class="status bad" style:width={size} style:height={size} />
    </div>
    <div class="text-container">{err}</div>
  {/await}
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
