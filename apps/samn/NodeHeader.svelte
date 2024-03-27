<script>
  import { encode } from "proquint";
  import BatteryIcon from "./BatteryIcon.svelte";
  export let node = { id: 14, name: "Pantry", battery: 100 };
</script>

<!-- Name + Battery -->
<div style="display: flex;">
  <span
    >{node.name
      ? node.name
      : node.id
        ? `(${encode(new Uint16Array([node.id]))}, ${node.id})`
        : ""}</span
  >
  <div style="flex-grow: 1;" />
  {#if typeof node.battery !== "undefined"}
    <span><BatteryIcon percentage={node.battery} /> {node.battery}%</span>
  {/if}
</div>
