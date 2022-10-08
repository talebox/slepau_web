<script>
  // export let location
  import { Link } from "svelte-routing"
  import Loading from "../comps/Loading.svelte"
  import { slide } from "svelte/transition"

  const url = "http://localhost:4000"

  let chunks = [],
    chunks_get$,
    chunks_new$

  function chunks_get() {
    chunks_get$ = fetch(url + "/chunks").then((v) => v.json())
    chunks_get$.then((v) => (chunks = v))
  }
  function chunks_new() {
    chunks_new$ = fetch(url + "/chunks", {
      method: "PUT",
      body: JSON.stringify({ value: "# New Chunk" }),
      headers: { "Content-type": "application/json" },
    }).then((v) => v.json())
    chunks_new$.then(() => chunks_get())
  }

  chunks_get()
</script>

{#await chunks_get$}
  <Loading />
{:then chunks}
	Loaded {chunks?.length()}
{:catch err}
  Error: {err}
{/await}
<div class="container">
  {#each chunks as chunk}
    <div class="chunk" transition:slide>
      <textarea bind:value={chunk.value} />
    </div>
  {/each}
</div>


<button class="toggle" on:click={chunks_new}>+</button>

<style>
  .container {
    display: grid;
  }
  .toggle {
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 5px;
    margin: 0;
    width: 50px;
    height: 50px;
    border-radius: 0;
    opacity: 1;
    /* background: var(--background-transparent); */
    transition: opacity 1s;
    border-top-left-radius: 20px;
  }
</style>
