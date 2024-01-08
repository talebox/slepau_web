<script lang="js">
    import { actions } from "./store";
    import { fetchE } from "@utils/network";
    import { Link } from "@deps/routing";
    import states from "@utils/states";

    let ips = actions.ips();

    let ipg_token = localStorage.getItem("ipg_token") || "";

    $: {
        localStorage.setItem("ipg_token", ipg_token);
    }

    let ipg_cache = JSON.parse(localStorage.getItem("ipg_cache") || "{}");
    $: {
        localStorage.setItem("ipg_cache", JSON.stringify(ipg_cache));
    }
    let ipg_requests = {};
    function fetch_geo(ip) {
        return fetchE(
            `https://api.ipgeolocation.io/ipgeo?apiKey=${ipg_token}&ip=${ip}`,
        )
            .then((v) => v.json())
            .then((v) => {
                ipg_cache[ip] = v;
                return v;
            });
    }
    function fetch_all(ips) {
        ips.map(([ip, ..._]) => ip)
            .filter((ip) => !ipg_cache[ip] && !ipg_requests[ip])
            .forEach((ip) => (ipg_requests[ip] = fetch_geo(ip)));
    }
</script>

{#await ips}
    Loading...
{:then ips}
    {#each ips as [ip, [lastTime, count, actions, users]]}
        <details style="padding-inline:8px;margin-block:8px;">
            <summary style="display: flex;padding-block:8px;align-items:center">
                {ip}
                {#if ipg_cache[ip]}
                    <img
                        src={ipg_cache[ip].country_flag}
                        alt="{ipg_cache[ip].country_name} flag"
                        style="height: 1em;margin-inline:1em"
                    />
                {/if}
                <div style="flex-grow: 1;" />
                {count}; {new Date(lastTime / 1000000).toLocaleString()}
            </summary>

            <details>
                <summary
                    >Location {#if ipg_cache[ip]}
                        {ipg_cache[ip].city}, {states[
                            ipg_cache[ip].state_prov
                        ] || ipg_cache[ip].state_prov}, {ipg_cache[ip]
                            .country_code2}
                    {/if}</summary
                >
                <button on:click={() => (ipg_requests[ip] = fetch_geo(ip))}>
                    {ipg_cache[ip] ? "Re" : ""} Fetch
                </button>

                {#if ipg_requests[ip]}
                    {#await ipg_requests[ip]}
                        Loading...
                    {:then ipg}
                        <code style="background: #0F01;"
                            >{JSON.stringify(ipg, undefined, 2)}</code
                        >
                    {:catch err}
                        <code style="background: #F001;"
                            >{JSON.stringify(err, undefined, 2)}</code
                        >
                    {/await}
                {:else if ipg_cache[ip]}
                    From Cache <br />
                    <code style="background: #0F01;"
                        >{JSON.stringify(ipg_cache[ip], undefined, 2)}</code
                    >
                {/if}
            </details>
            <details>
                <summary>
                    Users {Object.entries(users).length}
                </summary>
                <code style="background: #0F01;"
                    >{JSON.stringify(users, undefined, 2)}</code
                >
            </details>
            <details>
                <summary>
                    Actions {Object.entries(actions).length}
                </summary>
                <code style="background: #0F01;"
                    >{JSON.stringify(actions, undefined, 2)}</code
                >
            </details>
            <Link to="/app/details?ip={ip}">
                <button style="width: 100%;">Details</button>
            </Link>
        </details>
    {/each}
    <button on:click={() => fetch_all(ips)}>Fetch all ips</button>
{:catch err}
    {err}
{/await}

<h4>Location Token</h4>
<input bind:value={ipg_token} placeholder="IpGeolocation.io token..." />

<style>
    code {
        white-space: pre;
    }
</style>
