<script>
  export let selected$, chunk$

  import { navigate } from "svelte-routing"
  import { mdToHtml } from "../utils/commonmark"
  // import { basepath } from "../utils/routing"
</script>

<div
  class="chunk border"
  class:selected={$selected$?.includes($chunk$)}
  class:selectable={!!$selected$}
  on:click={() => {
    if (!!$selected$) {
      if ($selected$.includes($chunk$))
        $selected$ = $selected$.filter((v) => v !== $chunk$)
      else {
        $selected$.push($chunk$)
        $selected$ = $selected$
      }
    } else {
      navigate(`/notes/${$chunk$.created}`)
    }
  }}
>
  {@html $chunk$?.value ? mdToHtml($chunk$.value) : ""}
</div>

<style>
  .chunk {
    background: var(--background-alt);
    border-radius: 2em;
    cursor: pointer;
    padding: 1em;
    white-space: nowrap;
    overflow: hidden;

    min-height: 200px;
    max-height: 270px;
    transition: box-shadow 0.1s;
  }

  .chunk:hover {
    background: var(--background);
  }
  .chunk.selectable {
    box-shadow: 0 0 0 2px var(--focus);
  }
  .chunk.selected {
    box-shadow: 0 0 0 2px var(--links);
  }
</style>
