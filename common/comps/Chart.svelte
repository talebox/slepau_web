<script>
    import { Chart } from "frappe-charts";
    import merge from "lodash/merge";
    export let data;
    export let options = {};
    let element;
    let chart;
    $: {
        if (data && element) {
            chart = null;
            const opts = {
                ...merge(
                    {
                        type: "line",
                        height: 250,
                        axisOptions: {
                            xAxisMode: "tick", // default: 'span'
                            xIsSeries: true,
                        },
                        lineOptions: {
                            dotSize: 2, // default: 4
                            regionFill: 1,
                            hideDots: 1,
                            heatline: 1,
                            spline: 0,
                        },
                        animate: 0,
                        // valuesOverPoints: 1
                    },
                    options,
                ),
                data,
            };
            console.log(opts)
            chart = new Chart(element, opts);
        }
    }
</script>

<div bind:this={element} {...$$restProps} />
