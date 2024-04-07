<script>
  import { decode } from "proquint";
  import Limb from "./Limb.svelte";
  import { db, period } from "./store";
  import { passed_since_pretty, second_to_pretty } from "@utils/utils";

  export let id;
  let node;

  let incoming = db.subscribeTo("node/" + id);

  $: {
    if ($incoming) {
      node = $incoming;
      console.log(node);
    }
  }

  $: battery =
    node &&
    Object.values(node.limbs)
      ?.filter((limb) => !!limb?.data?.Sensor)
      ?.find((sensor) => typeof sensor.data.Sensor.data.Battery !== "undefined")
      ?.data.Sensor.data.Battery;
</script>

<div class="container">
  <h2>
    Details for {node?.info?.name || node?.id}
  </h2>
  <table style="width: auto;">
    <tbody>
      <tr
        ><th>id:</th><td>{node?.id}</td
        ></tr
      >
      <tr><th>board:</th><td>{node?.info?.board}</td></tr>
      <tr
        ><th>uptime:</th><td
          >{node?.uptime ? second_to_pretty(node?.uptime) : 0}</td
        ></tr
      >
      <tr
        ><th>last message:</th><td
          >{node?.last
            ? passed_since_pretty(node?.last / 1000000000)[0]
            : 0}</td
        ></tr
      >
    </tbody>
  </table>
  <div
    style="display: flex; gap: 12px; justify-content: flex-end; align-items:center"
  >
    Period of
    <select style="margin: 0;" bind:value={$period}>
      {#each [[3600, "1hr"], [3600 * 24, "1d"], [3600 * 24 * 7, "1w"], [3600 * 24 * 30, "1m"]] as [value, name]}
        <option {value}>{name}</option>
      {/each}
    </select>
  </div>

  {#each (node?.limbs && Object.values(node?.limbs).sort( (a, b) => (a.id > b.id ? 1 : -1), )) || [] as limb}
    <Limb node_id={node.id} limb_id={limb.id} />
  {/each}
</div>

<style>
  .container {
    margin-bottom: 30vh;
  }
</style>
