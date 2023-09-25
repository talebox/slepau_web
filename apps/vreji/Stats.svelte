<script>
    import Chart from "./Chart.svelte";
    import { actions, period, limit } from "./store";
    export let query = {};

    
    $: data = actions.stats_data({ ...query, period: $period, limit: $limit });
</script>

<div style="display: flex; justify-content: flex-end">
    <select bind:value={$period}>
        {#each [
            [3600, "1hr"],
            [3600 * 24, "1d"],
            [3600 * 24 * 7, "1w"],
            [3600 * 24 * 7 * 30, "1m"],
        ] as [value, name]}
            <option {value}>{name}</option>
        {/each}
    </select>
</div>

{#await data}
    Loading...
{:then data}
    <Chart {data} />
{/await}
