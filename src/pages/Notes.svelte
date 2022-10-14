<script>
  import { navigate } from "svelte-routing"
  import { slide } from "svelte/transition"
  import Chunk from "../comps/Chunk.svelte"
  import { basepath } from "../utils/routing"

  import { chunks } from "../store"
  import "./chunk.css"
  import { writable } from "svelte/store"

  let selected$ = writable(undefined)
  // let selected = $selected$;
</script>

{#if $chunks !== undefined}
  <div class="container grid-r">
    {#each Object.values($chunks) as [chunk, chunk$]}
      {#if chunk$}
        <Chunk {selected$} {chunk$} />
      {/if}
    {/each}
  </div>
{/if}

{#if $selected$ === undefined}
  <button
    class="new icon fixed"
    transition:slide
    on:click={() => chunks.put({ value: "# New Chunk" })}
  >
    <svg fill="currentColor" viewBox="0 0 16 16">
      <path
        fill-rule="evenodd"
        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
      />
    </svg>
  </button>
{:else}
  <button
    class="del icon fixed"
    transition:slide
    on:click={() => chunks.del($selected$).then(() => ($selected$ = undefined))}
  >
    <svg fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
      />
      <path
        fill-rule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
      />
    </svg>
  </button>
{/if}

<button
  class="select icon fixed"
  transition:slide
  on:click={() => ($selected$ = $selected$ ? undefined : [])}
>
  <svg fill="currentColor" viewBox="0 0 16 16">
    <path
      d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"
    />
    <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
  </svg>
</button>

<slot />

<style>
  .container {
    gap: 20px;
  }

  .new,
  .select,
  .del {
    opacity: 1;
    transition: opacity 1s;
  }
  .new {
    bottom: 0;
    right: 0;
  }
  .select {
    bottom: 0;
    right: var(--button-icon-size);
    border-top-left-radius: 20px;
  }
  .del {
    bottom: 0;
    right: 0;
  }
</style>
