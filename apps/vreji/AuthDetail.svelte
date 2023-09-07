<script lang="js">
    import { onDestroy } from "svelte";
    import {actions} from "./store"
    import {fetchE} from '@utils/network';
    import Loading from "@comps/Loading.svelte";

    let ips = actions.auth_ips();
    // let logins = actions.;

</script>

<h3>Ips</h3>
{#await ips}
    Loading...
{:then ips}
    {#each ips as ip}
        <div class="card" style="display: flex;padding: 8px;margin-bottom: 2px;">
            {ip[0]}
            <div style="flex-grow: 1;"/>
            last request {new Date (ip[1][0] / 1000000).toLocaleString()};
            {ip[1][1]} requests
        </div>
    {/each}
{:catch err} 
    {err}
{/await}

<!-- <h3>Logins</h3>
{#await logins}
    Loading...
{:then logins}
    {#each logins as login}
        <div class="card" style="display: flex;padding: 8px;margin-bottom: 2px;">
            {ip[0]}
            <div style="flex-grow: 1;"/>
            last request {new Date (ip[1][0] / 1000000).toLocaleString()};
            {ip[1][1]} requests
        </div>
    {/each}
{:catch err} 
    {err}
{/await} -->

<style>
    .card{
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #777;
    }
</style>