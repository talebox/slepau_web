<script>
  import { db, editing_id } from "../store"
  import Chunks from "../comps/Chunks.svelte"
  import SelectedButtons from "../comps/SelectedButtons.svelte"
  import "./ChunkPage.scss"

  let chunks = db.subscribeTo("chunks", [])

  let selected = undefined
	
  const on_delete = () =>
    db.actions.chunks.del(selected).then(() => (selected = undefined))
  const on_new = () => {
    db.actions.chunks.new()
  }
</script>

<Chunks chunks={$chunks} {selected} let:chunk>
  <div
    class="clickable"
    on:click={() => {
      if (selected) {
        if (selected.includes(chunk.id))
          selected = selected.filter((v) => v !== chunk.id)
        else {
          selected.push(chunk.id)
          selected = selected
        }
      } else {
        $editing_id = chunk.id
      }
    }}
  />
</Chunks>

<SelectedButtons bind:selected {on_new} {on_delete} />

<slot />

<style>
  .clickable {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>
