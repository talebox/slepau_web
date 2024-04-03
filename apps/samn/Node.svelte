<script>
  import { Link } from "@deps/routing";
  import { actions, db } from "./store";
  import nots from "@stores/notifications";
  import BatteryIcon from "./icons/BatteryIcon.svelte";
  import LightIcon from "./icons/LightIcon.svelte";
  import TempIcon from "./icons/TempIcon.svelte";
  import HumIcon from "./icons/HumIcon.svelte";
  export let node;

  $: done_actions = node ? [] : [];

  $: battery =
    node &&
    Object.values(node.limbs)
      ?.filter((limb) => !!limb?.data?.Sensor)
      ?.find((sensor) => typeof sensor.data.Sensor.data.Battery !== "undefined")
      ?.data.Sensor.data.Battery;
</script>

<div class="container">
  <!-- Name + Battery -->
  <div style="display: flex;">
    <Link to={"node/" + node.id}
      ><span>{node.info?.name ? node.info?.name : node?.id ? node.id : ""}</span
      ></Link
    >
    <div style="flex-grow: 1;" />
    {#if typeof battery !== "undefined"}
      <span><BatteryIcon percentage={battery} /> {battery}%</span>
    {/if}
  </div>
  <!-- Limbs -->
  {#each (node?.limbs && Object.values(node?.limbs).sort( (a, b) => (a.id > b.id ? 1 : -1), )) || [] as limb}
    {#if limb?.data?.Sensor}
      <!-- Sensor -->
      {#if typeof limb.data.Sensor.data?.TempHum !== "undefined"}
        <!-- Temp Hum -->
        <div style="display: flex; justify-content:space-evenly;padding:4px">
          <div
            style="display: flex; align-items:center; gap:8px"
            title="Temperature"
          >
            <TempIcon
              style="height:2em"
              temperature={limb.data.Sensor.data.TempHum[0] / 100}
            />
            <div>
              {(limb.data.Sensor.data.TempHum[0] / 100).toFixed(0)}°C <br />
              {(
                ((limb.data.Sensor.data.TempHum[0] / 100) * 9) / 5 +
                32
              ).toFixed(0)}°F
            </div>
          </div>
          <div
            style="display: flex; align-items:center; gap:8px"
            title="Relative Humidity"
          >
            <HumIcon
              style="height:2em"
              humidity={limb.data.Sensor.data.TempHum[1]}
            />{limb.data.Sensor.data.TempHum[1]}%
          </div>
        </div>
      {/if}
    {:else if limb?.data?.Actuator}
      <!-- Actuator -->
      <div style="display:flex;align-items:center;padding:4px">
        <!-- {limb.id} -->
        <!-- Display -->
        {#if typeof limb.data.Actuator.Light !== "undefined"}
          <LightIcon style="height:2em" on={limb.data.Actuator.Light} />
        {/if}

        <div style="flex-grow: 1;" />
        <!-- Actions -->
        {#if typeof limb.data.Actuator.Light !== "undefined"}
          <button
            disabled={done_actions.includes(node.id + "_" + limb.id)}
            on:click={() => {
              done_actions = [...done_actions, node.id + "_" + limb.id];
              actions.setLimb
                .light(node.id, limb.id, !limb.data.Actuator.Light)
                .then((v) => {
                  nots.add(
                    `${node.info.name} Light turned ${!limb.data.Actuator.Light ? "on" : "off"}`,
                  );
                });
            }}
          >
            {done_actions.includes(node.id + "_" + limb.id)
              ? "Turning light"
              : "Turn"}
            {!limb.data.Actuator.Light ? "On" : "Off"}
          </button>
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  button {
    margin: 0;
  }
  .container {
    padding: 8px;
    border-radius: 8px;
    background: #8882;
    border: 1px solid #8888;
    transition: background 0.2s;
    /* cursor: pointer; */
    display: flex;
    gap: 8px;
    flex-flow: column nowrap;
  }
  .container:hover {
    background: #8883;
  }
</style>
