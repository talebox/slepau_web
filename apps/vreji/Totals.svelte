<script>
    import Chart from "./Chart.svelte";
    import { actions } from "./store";
    const limit = window.innerWidth < 500 ? 12 : 24;
    let query = Object.fromEntries(new URLSearchParams(window.location.search));
    let data_total = actions.stats_data({
        total: true,
        limit,
        ...query,
    });
</script>

<h1>For</h1>
{#each Object.entries(query) as [k,v]}
<div style="font-size: 1.3em;">
    <b><code>{k}</code></b>:<code>{v}</code>
</div>
{/each}

<h2>Total</h2>
{#await data_total}
    Loading...
{:then data}
    <Chart {data} />
{/await}
<style>
</style>