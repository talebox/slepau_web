<script>
  import { slide, fly, fade } from "svelte/transition"
  import { useDelay } from "../utils/timout"
  import { chunks } from "../store"
  import { navigate } from "svelte-routing"

  export let created
  export let chunk = {}

  $: chunk = $chunks?.find((c) => c.created == created)
</script>

<div class="container" transition:fly={{ y: 200 }}>
  {#if chunk}
    <textarea
      class="edit"
      bind:value={chunk.value}
      on:input={() => useDelay(() => chunks.put(chunk), 1000, "chunks")}
    />
  {:else}
    Bad chunk
  {/if}
  <button class="close" on:click={() => navigate("..")}>X</button>
</div>

<!-- <div></div> -->
<style>
  .container {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100svh - 40px);
    width: 100%;
    z-index: 1;
  }
  .edit {
    position: absolute;
    top: 0;
    right: 0;
    resize: none;
    height: 100%;
    width: 100%;
  }
  .close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px;
		margin: 0;
		width: 36px;
		height: 36px;
		border-radius: 0 6px 0 12px;
		
  }
</style>
