<script>
    import 'chartist/dist/index.css';
    import { LineChart } from "chartist";
    import merge from "lodash/merge";
    import { onDestroy } from "svelte";
    export let data;
    export let options = {};
    let element;
    let chart;
    $: {
        if (data && element) {
            chart = null;
            const opts = merge({}, options);
            chart = new LineChart(element, data, opts);
        }
    }
    onDestroy(() => {
        chart?.detach()
        chart = null;
    });
</script>

<div bind:this={element} {...$$restProps} />
