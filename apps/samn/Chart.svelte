<script>
    import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";
    export let data;
    export let type = "line";
    export let height = 250;
    let element;

    $: {
        if (data && element) {
            new Chart(element, {
                data,
                type,
                height,
                axisOptions: {
                    xAxisMode: "tick", // default: 'span'
                    xIsSeries: true,
                },
                lineOptions: {
                    dotSize: 2, // default: 4
                    regionFill: 1,
                    hideDots: 1,
                    heatline: 1,
                    spline: 0
                },
                animate: 0,
                // valuesOverPoints: 1
            });
        }
    }
</script>

<div bind:this={element} {...$$props} />
