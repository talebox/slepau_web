<script>
  import { debounce } from "@utils/timeout";
  import { decode } from "proquint";
  import Limb from "./Limb.svelte";
  import { actions, db, period } from "./store";
  import { second_to_pretty, fraction_digits_samn } from "@utils/utils";
  import PassedSince from "@comps/PassedSince.svelte";
  import { onDestroy } from "svelte";

  export let id;
  let node;

  let incoming = db.subscribeTo("views/nodes/" + id);

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
      ?.find((sensor) => typeof sensor.data.Sensor?.data?.Battery !== "undefined")
      ?.data.Sensor.data.Battery;

  $: ui = node?.ui || {};

  function ui_changed() {
    debounce(() => actions.setUiData(node.id, ui));
  }
</script>

<div class="container">
  <h2>
    Details for {node?.ui?.name || node?.id}
  </h2>

  <label
    >Name
    <input
      disabled={!node}
      bind:value={ui.name}
      on:input={ui_changed}
      placeholder="Cool Node"
    />
  </label>

  <table style="width: auto;">
    <tbody>
      <tr><th>id:</th><td>{node?.id}</td></tr>
      <tr><th>board:</th><td>{node?.info?.board}</td></tr>
      <tr
        ><th>uptime:</th><td
          >{node?.uptime ? second_to_pretty(node?.uptime) : 0}</td
        ></tr
      >
      <tr
        ><th>last message:</th><td
          ><PassedSince
            epoch_seconds={node?.last && node.last}
            fraction_digits={fraction_digits_samn}
          /></td
        ></tr
      >
    </tbody>
  </table>

  <div
    style="display: flex; gap: 12px; justify-content: flex-end; align-items:center"
  >
    Period of
    <select style="margin: 0;" bind:value={$period}>
      {#each [[60 * 10, "10m"], [3600, "1hr"], [3600 * 24, "1d"], [3600 * 24 * 7, "1w"], [2_629_746 /** average month*/, "1M"]] as [value, name]}
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
