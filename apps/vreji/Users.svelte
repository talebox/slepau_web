<script>
    import { actions } from "./store";
    import { Link } from "@deps/routing";
    let users = actions.users();
</script>

{#await users}
    Loading...
{:then users}
    {#each users as [user, [lastTime, count, actions, ips]]}
        <details style="padding-inline:8px;margin-block:8px;">
            <summary style="display: flex;padding-block:8px;align-items:center">
                {user}
                <div style="flex-grow: 1;" />
                {count}; {new Date(lastTime / 1000000).toLocaleString()}
            </summary>
            <details>
                <summary>
                    Ips {Object.entries(ips).length}
                </summary>
                <code style="background: #0F01;"
                    >{JSON.stringify(ips, undefined, 2)}</code
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
            <Link to="/app/details?user={user}">
                <button style="width: 100%;">Details</button>
            </Link>
        </details>
    {/each}
{:catch err}
    {err}
{/await}

<style>
    code {
        white-space: pre;
    }
</style>
