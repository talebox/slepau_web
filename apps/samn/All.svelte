<script>
  import Node from "./Node.svelte";
  import { db } from "./store";

  // Get nodes here
  let nodes = [];
  let incoming = db.subscribeTo("views/nodes");

  $: {
    if ($incoming) {
      nodes = Object.values ($incoming).sort((a,b) => a.id > b.id ? 1 : -1);
      console.log(nodes);
    }
  }
</script>

<div style="gap: 8px" class="grid-r">
  {#each nodes as node}
    <!-- <Link to={`node/${node.id}`}> -->
      <Node {node} />
    <!-- </Link> -->
  {/each}
</div>
