<script>
  // export let location
  import { navigate } from "svelte-routing"
  import chunk_new_icon from "bundle-text:@icons/plus-lg.svg"

  import { slide } from "svelte/transition"
  import { useDelay } from "../utils/timout"
  // import { fetchJson } from "../utils/network"
  import { mdToHtml } from "../utils/commonmark"
  import { chunks } from "../store"
  import "./chunk.css"

  let selected = undefined
</script>

{#if $chunks !== undefined}
  <div class="container">
    {#each $chunks as chunk}
      <div
        class="chunk border"
        class:selectable={!!selected}
        class:selected={selected?.includes(chunk)}
        on:click={() => {
          if (!!selected) {
            if (selected.includes(chunk))
              selected = selected.filter((v) => v !== chunk)
            else {
              selected.push(chunk)
              selected = selected
            }
          } else {
            navigate(`/chunks/${chunk.created}`)
          }
        }}
        transition:slide
      >
        {@html mdToHtml(chunk.value)}
      </div>
    {/each}
  </div>
{/if}

{#if selected === undefined}
  <button
    class="new"
    transition:slide
    on:click={() => chunks.put({ value: "# New Chunk" })}
  >
    {@html chunk_new_icon}
  </button>
{:else}
  <button class="del" transition:slide on:click={() => chunks.del(selected)}>
    R
  </button>
{/if}

<button
  class="select"
  transition:slide
  on:click={() => (selected = selected ? undefined : [])}
>
  S
</button>

<style>
  .chunk {
    /* transform: scale(.5); */
    font-size: 0.7em;
    border-radius: 2em;
    cursor: pointer;
    padding: 1em;
		flex: 180px 1 1;
		max-height: 200px;
		overflow: hidden;
		
  }

  .chunk:hover {
    background: var(--background-alt);
  }
  .chunk.selectable {
    border: 1px dashed blue;
  }
  .chunk.selected {
    border: 1px solid blue;
  }

  .container {
    display: flex;
		gap: 20px;
		flex-flow: row wrap;
  }
	
  .new,
  .select,
  .del {
    position: fixed;
    padding: 5px;
    margin: 0;
    width: 50px;
    height: 50px;
    border-radius: 0;
    opacity: 1;
    transition: opacity 1s;
  }
  .new {
    bottom: 0;
    right: 0;
  }
  .select {
    bottom: 0;
    right: 50px;
    border-top-left-radius: 20px;
  }
  .del {
    bottom: 0;
    right: 0;
  }
</style>
