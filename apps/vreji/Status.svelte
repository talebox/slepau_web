<script>
    import Chart from "./Chart.svelte";
    import Ips from "./Ips.svelte";
    import Users from "./Users.svelte";
    import { actions } from "./store";

    let ipg_token = localStorage.getItem("ipg_token") || "";

    $: {
        localStorage.setItem("ipg_token", ipg_token);
    }

    const limit = window.innerWidth < 500 ? 12 : 24;
    let data_total = actions.stats_data({ total: true, limit });
    let data_auth = actions.stats_data({ key: "auth%", limit });
    let data_chunk = actions.stats_data({ key: "chunk%", limit });
    let data_media = actions.stats_data({ key: "media%", limit });
</script>

{#each [["Total", data_total], ["Auth", data_auth], ["Chunk", data_chunk], ["Media", data_media]] as [name, data]}
    <h2>{name}</h2>
    {#await data}
        Loading...
    {:then data}
        <Chart {data} />
    {/await}
{/each}

<hr />
<h3>Ips</h3>
<Ips />

<hr />
<h3>Users</h3>
<Users />

<hr />
<h4>Location Token</h4>
<input bind:value={ipg_token} placeholder="IpGeolocation.io token..." />

<style>
</style>
