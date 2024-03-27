<script>
  import Node from "./Node.svelte";

  // Get nodes here
  let nodes = new Promise((resolve, reject) =>
    setTimeout(() => resolve([14]), 400),
  );
</script>

{#await nodes}
  Loading...
{:then nodes}
  <div style="gap: 8px" class="grid-r">
    {#each nodes as id}
      <Node {id} />
    {/each}
  </div>
{/await}
