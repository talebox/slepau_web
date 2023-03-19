<script>
  import SelectedButtons from "@comps/SelectedButtons.svelte"
  import { actions, db, editing_id$, make_query } from "./store"
  import { flip } from "svelte/animate"
  import Media from "./Media.svelte"
  let id
  $: view_all$ = db.subscribeTo("views/all" + (id ? "/" + id : ""), {
    init: [],
  })
  $: view_all = $view_all$ ?? [] 
  // $: console.log(view_all)

  let selected

  function add_media() {
    if (!this.files.length) {
      console.log("no files selected")
      return
    }
    const files = Array.from(this.files)
    actions.media.post_many(files)
  }
  $: console.log(selected)

  let file_input
  function on_add() {
    file_input?.click()
  }
  function on_remove() {
    actions.media.remove_many(selected)
    selected = undefined
  }

  function on_click(media) {
    if (selected) {
      if (selected.includes(media.id)) {
        selected = selected.filter((id) => id !== media.id)
      } else {
        selected = [...selected, media.id]
      }
    } else {
      $editing_id$ = media.id
    }
  }
</script>

<button
  on:click={() => {
    actions.media.remove_many(view_all.map((v) => v.id))
    selected = undefined
  }}>RemoveAll</button
>

<input
  bind:this={file_input}
  on:change={add_media}
  type="file"
  style="display:none;"
  multiple
/>

<div style="gap: 20px;" class="mygrid">
  {#each view_all as media (media.id)}
    <div
      class="element {selected
        ? selected.includes(media.id)
          ? 'selected'
          : 'selectable'
        : 'clickable'}"
      animate:flip={{ duration: 500 }}
      on:click={() => {
        on_click(media)
      }}
    >
      <Media
        {media}
				query="type=image/webp&max=300"
				width="300"
				height="300"
      />
    </div>
  {/each}
</div>

<SelectedButtons bind:selected {on_add} {on_remove} />

<style>
  .clickable,
  .selectable,
  .selected {
    cursor: pointer;
  }
  .selectable {
    outline: 4px dashed var(--selection);
  }

  .clickable:hover,
  .selectable:hover {
    outline: 4px solid var(--selection);
  }
  .selected {
    outline: 6px solid var(--selection);
  }
  .mygrid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
  .element {
    position: relative;
    height: 300px;
    max-width: 300px;
  }
</style>
