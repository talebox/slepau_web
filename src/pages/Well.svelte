<script>
  import { slide } from "svelte/transition"
  import { flip } from "svelte/animate"
  import { navigate } from "@deps/routing"
  import { editing_id, db } from "../store"
  import SelectedButtons from "../comps/SelectedButtons.svelte"
  import * as s from "./Well.module.scss"
  import Chunk from "../comps/Chunk.svelte"
  import "./ChunkPage.scss"

  export let id = ""

  let root_title
  let well = []
  $: well$ = db.subscribeTo("views/well" + (id ? "/" + id : ""), [[], null])

  $: {
    let [children, root] = $well$
    well = children
    root_title = root?.[1].title
  }
  let selected = undefined

  const on_delete = () =>
    db.actions.chunks.del(selected).then(() => (selected = undefined))
  const on_new = () => {
    db.actions.chunks.new(`# New Chunk${id ? ` -> ${id}` : ""}\n\n`)
  }
</script>

<div class="breadcrumb" in:slide>
  {#if id}
    <button on:click={() => history.back()} class="back">
      <svg fill="currentColor" viewBox="0 0 16 16">
        <path
          fill-rule="evenodd"
          d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
        />
      </svg>
    </button>
  {/if}
  <h1>{root_title ?? "Root"}</h1>
</div>

<div class="container chunk-container grid-r" style="gap: 20px">
  {#each well as id (id)}
    <div
      class="chunk border"
      class:selected={selected?.includes(id)}
      class:selectable={!!selected}
      animate:flip={{ duration: 500 }}
      on:click={() => {
        if (!selected) return
        if (selected.includes(id)) selected = selected.filter((v) => v !== id)
        else {
          selected.push(id)
          selected = selected
        }
      }}
    >
      {#if !selected}
        <div
          class={s.left}
          on:click={() => {
            // navigate(`/chunk/${id}`);
            $editing_id = id
          }}
        />
        <div
          class={s.right}
          on:click={() => {
            navigate(`/well/${id}`)
          }}
        />
      {/if}
      <Chunk {id} />
    </div>
  {/each}
</div>

<SelectedButtons bind:selected {on_new} {on_delete} />

<slot />

<style>
  .back {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 0;
  }
  .breadcrumb {
    position: fixed;
    background: var(--background-transparent);
    top: 0;
    left: 0;
    height: 70px;
    /* padding-block: 1em; */
    width: 100vw;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 1;
  }
  .breadcrumb > * {
    margin: 0;
  }
  .breadcrumb * {
    transition: font-size 0.5s;
  }
  .current {
    font-size: 1.8em;
    font-weight: bold;
  }
  .container {
    padding-top: 70px;
  }
</style>
