<script>
  import Node from "./Node.svelte";
  import {db} from "./store"

  // Get nodes here
  let nodes = [];
  let incoming = db.subscribeTo("views/nodes")

  $: {
    if ($incoming) {
      console.log($incoming)
    }
  }
</script>

<div style="gap: 8px" class="grid-r">
  {#each nodes as id}
    <Node {id} />
  {/each}
</div>
