<script>
    import Chart from "@comps/ChartIst.svelte";
    import { db, period, limit } from "./store";

    export let node_id;
    export let limb_id;

    $: incoming = db.subscribeTo(
        `views/nodes/${node_id}/${limb_id}/${$period}/${$limit}`,
    );
    let keys;
    let values;
    let first;
    $: {
        if ($incoming) {
            // console.log($incoming);
            keys = Object.keys($incoming).map((v) => Number(v));
            values = Object.values($incoming);
            first = Object.values($incoming)?.[0];
        }
    }
</script>

{#if typeof first?.Sensor?.data?.Battery !== "undefined"}
    <h4>Battery %</h4>
    <Chart
        data={{
            labels: keys,
            series: [values.map((v) => v.Sensor.data?.Battery || 0)],
        }}
        options={{
            // high:100,
            scaleMinSpace: 30,
        }}
    />
{:else if typeof first?.Sensor?.data?.TempHum !== "undefined"}
    <h4>Temperature °F / Humidity %</h4>
    <Chart
        data={{
            labels: keys,
            series: [
                values.map((v) =>
                    v.Sensor.data
                        ? ((v.Sensor.data.TempHum[0] / 100) * 9) / 5 + 32
                        : 0,
                ),
                values.map((v) =>
                    v.Sensor.data ? v.Sensor.data.TempHum[1] : 0,
                ),
            ],
        }}
    />
{:else if typeof first?.Sensor?.data?.Current !== "undefined"}
    <h4>Current mA</h4>
    <Chart
        data={{
            labels: keys,
            series: [
                values.map((v) =>
                    v.Sensor.data
                        ? v.Sensor.data.Current
                        : 0,
                ),
            ],
        }}
    />
{:else if typeof first?.Actuator?.Light !== "undefined"}
    <h4>Light (on/off)</h4>
    <Chart
        data={{
            labels: keys,
            series: [values.map((v) => (v.Actuator.Light ? 1 : 0))],
        }}
    />
{/if}
