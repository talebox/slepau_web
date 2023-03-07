<script>
  import SelectedButtons from "@comps/SelectedButtons.svelte"
  import { actions, db } from "./store"
  import { flip } from "svelte/animate"
  let id
  $: view_all$ = db.subscribeTo("views/all" + (id ? "/" + id : ""), {
    init: [],
  })
  $: view_all = $view_all$ ?? []
  $: console.log(view_all)

  let selected

  function add_media() {
    if (!this.files.length) {
      console.log("no files selected")
      return
    }
    const files = Array.from(this.files)
    actions.media.post_many(files)
  }

  let file_input
  function on_add() {
    file_input?.click()
  }
</script>

<input
  bind:this={file_input}
  on:change={add_media}
  type="file"
  style="display:none;"
  multiple
/>
<SelectedButtons bind:selected {on_add} />

<div style="gap: 20px;" class="mygrid">
  {#each view_all as media_id (media_id)}
    <div class="element" animate:flip={{ duration: 500 }}>
      <img src="/media/{media_id}?max=300" alt="" />
    </div>
  {/each}
</div>

<style>
  .mygrid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .element {
    height: 300px;
    max-width: 300px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
