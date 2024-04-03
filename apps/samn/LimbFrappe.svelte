<script>
    import Chart from "@comps/Chart.svelte";
    import { db } from "./store";

    export let node_id;
    export let limb_id;

    let limb_history = null;
    let incoming = db.subscribeTo(`views/${node_id}/${limb_id}`);

    $: {
        if ($incoming) {
            let datasets;
            const entries = Object.entries($incoming).sort(
                ([ka, va], [kb, vb]) => Number(ka) - Number(kb),
            );
            const labels = entries.map(([k, v]) => Number(k));
            const values = entries.map(([k, v]) => v);
            const first = values[0];
            if (first?.Sensor) {
                if (typeof first.Sensor.data.Battery !== "undefined") {
                    datasets = [
                        {
                            name: "Battery",
                            values: values.map((v) => v.Sensor.data.Battery),
                        },
                    ];
                } else if (typeof first.Sensor.data.TempHum !== "undefined") {
                    datasets = [
                        {
                            name: "Temperature",
                            values: values.map((v) => v.Sensor.data.TempHum[0]),
                        },
                        {
                            name: "Humidity",
                            values: values.map((v) => v.Sensor.data.TempHum[1]),
                        },
                    ];
                }
            } else if (first?.Actuator) {
                if (typeof first.Actuator.Light !== "undefined") {
                    datasets = [
                        {
                            name: "Light",
                            values: values.map((v) => v.Actuator.Light),
                        },
                    ];
                }
            }
            if (typeof datasets !== "undefined") {
                limb_history = {
                    labels,
                    datasets,
                };
            }
            // console.log($incoming);
            console.log(limb_history);
        }
    }
</script>

{#if limb_history}
    <Chart data={limb_history} options={{
        axisOptions: {
            xAxisMode: "span",
            xIsSeries: false,
        }
    }} />
{/if}
