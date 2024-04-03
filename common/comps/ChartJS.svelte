<script>
    import Chart from "chart.js/auto";
    import merge from "lodash/merge";
    import {onDestroy} from "svelte";
    export let data;
    export let options = {};
    let element;
    let chart;
    $: {
        if (data && element) {
            chart = null;
            const opts = {
                ...merge(
                    {type: 'line'},
                    options,
                ),
                data,
            };
            console.log(opts)
            chart = new Chart(element, opts);
        }
    }
    onDestroy(() => {
        chart = null;
    })
</script>

<div style="width: 800px;"><canvas bind:this={element}></canvas></div>
