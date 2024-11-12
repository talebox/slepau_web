<script>
  import { Link } from "@deps/routing";
  import { actions, db } from "./store";
  import nots from "@stores/notifications";
  import BatteryIcon from "./icons/BatteryIcon.svelte";
  import LightIcon from "./icons/LightIcon.svelte";
  import TempIcon from "./icons/TempIcon.svelte";
  import HumIcon from "./icons/HumIcon.svelte";
  import PassedSince from "@comps/PassedSince.svelte";
  import { fraction_digits_samn } from "@utils/utils";
  export let node;

  const commands$ = db.subscribeTo("commands", { init_with: [] });
  $: commands = $commands$;

  $: done_actions = node ? [] : [];

  // Attemps to pull battery value
  $: battery =
    node &&
    Object.values(node.limbs)
      ?.filter((limb) => !!limb?.data?.Sensor)
      ?.find(
        (sensor) => typeof sensor.data.Sensor?.data?.Battery !== "undefined",
      )?.data.Sensor.data.Battery;

  // This calculates and updates seconds passed since last node update
  let interval;
  let passed_since = 0;
  $: last_update = node?.last;
  function update() {
    passed_since = Date.now() / 1000 - last_update;
  }
  $: if (last_update) {
    update();
    clearInterval(interval);
    interval = setInterval(update(), 1000);
  }
  function clamp(v, a, b) {
    return Math.floor(Math.min(b, Math.max(a, v)));
  }
  function charge_total(v) {
    return clamp(1 / ((v + 17) / 300) + 3, 2, 20);
  }
  function charge_speed(v) {
    
    return clamp(1000 / ((v + 6) / 150), 500, 10_000);
  }
  // let curr = 2;
</script>

<div class="container">
  <!-- Name + Battery -->
  <div style="display: flex; align-items:center; gap: 6px">
    <div
      class="status"
      style="background: {last_update && passed_since > 60 * 5
        ? '#7b2117'
        : '#177b17'};"
    />
    <Link to={"node/" + node.id}
      ><span>{node?.ui?.name || node?.id || ""}</span></Link
    >
    <!-- <div style="margin-left: 10px; opacity: .3">
      <PassedSince
        epoch_seconds={node?.last}
        fraction_digits={fraction_digits_samn}
      />
    </div> -->
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
      {:else if typeof limb.data.Sensor.data?.Current !== "undefined"}
        <div style="margin-top: 8px;">
          <div style="text-align: center;">
            {limb.data.Sensor.data.Current} mA
          </div>
          <div class="cable" style="margin-top: 6px;
          background: color-mix(in hsl, #210d0a80 {Math.min(limb.data.Sensor.data.Current, 1000)}%, #0a211080)">
            {#each new Array(charge_total(limb.data.Sensor.data.Current)) as _, i}
              <div
                class="charge"
                style="
                animation-delay: {(charge_speed(limb.data.Sensor.data.Current) /
                  charge_total(limb.data.Sensor.data.Current)) *
                  i}ms;
                animation-duration: {charge_speed(
                  limb.data.Sensor.data.Current,
                )}ms;"
              ></div>
            {/each}
          </div>
        </div>
        <!-- <input type="range" min="0" max="1000" bind:value={curr}/> -->
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
          {#if ["SamnSwitch", "SamnDC"].includes(node?.info?.board)}
            <button
              on:click={() => {
                actions.toggleLimb(node.id, limb.id);
              }}>Toggle</button
            >
          {:else}
            <button
              disabled={!!commands.find((c) => c.for_id === node.id)}
              on:click={() => {
                done_actions = [...done_actions, node.id + "_" + limb.id];
                actions.setLimb.light(
                  node.id,
                  limb.id,
                  !limb.data.Actuator.Light,
                );
                // .then((v) => {
                //   nots.add(
                //     `${node.info.name || ""} Light turned ${!limb.data.Actuator.Light ? "on" : "off"}`,
                //   );
                // })
              }}
            >
              {!!commands.find((c) => c.for_id === node.id)
                ? "Turning light"
                : "Turn"}
              {!limb.data.Actuator.Light ? "On" : "Off"}
            </button>
          {/if}
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
    overflow: hidden;
    position: relative;
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
  .cable {
    width: 100%; /* Length of the cable */
    height: 10px; /* Thickness of the cable */
    background-color: #8882;
    position: relative;
    overflow: hidden;
    border-radius: 99px;
    transition: background 1s;
  }
  .charge {
    width: 10px; /* Size of the charge */
    height: 10px;
    background-color: #177b17;
    position: absolute;
    left: -10px; /* Start position (outside the cable) */
    top: 0;
    border-radius: 99px;
    animation: moveCharge 2s linear infinite; /* Default speed is 2s */
  }
  /* .status {
    width: 8px;
    height: 8px;
    position: absolute;
    top: 0;
    right: 0;
    border-bottom-left-radius: 4px;
  } */
  .status {
    width: 8px;
    height: 8px;
    /* position: absolute; */
    /* top: 4px;
    right: 4px; */
    border-radius: 99px;
  }
  @keyframes moveCharge {
    0% {
      left: -10px;
    }
    100% {
      left: calc(100%); /* Should match the cable's width */
    }
  }
</style>
