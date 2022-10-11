<script>
  import { status } from "./store"
  import Loading from "./comps/Loading.svelte"
	
	let size = "15px";
	
</script>

<div class="container">
  {#await $status}
    <Loading size={size} />
  {:then}
    <div class="status" style:width={size} style:height={size}/>
  {:catch}
    <div class="status bad" style:width={size} style:height={size}/>
  {/await}
</div>

<style>
  .status {
    background: green;
    border-radius: 99px;
    /* display: inline-block; */
    /* width: 10px;
    height: 10px; */
  }
  .status.bad {
    background: red;
  }
  .container {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    background-color: var(--button-base);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
		z-index: 5;
  }
</style>
