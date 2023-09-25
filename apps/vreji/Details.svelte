<script>
    import Stats from "./Stats.svelte";
    let query = Object.fromEntries(new URLSearchParams(window.location.search));
</script>

<h1>Details</h1>

<h1>For</h1>
{#each Object.entries(query) as [k,v]}
<div style="font-size: 1.3em;">
    <b><code>{k}</code></b>:<code>{v}</code>
</div>
{/each}

<h2>Total</h2>
<Stats query={{total: true, ...query}}/>
<h2>Auth</h2>
<Stats query={{total: true, ...query, key: "auth%"}}/>
<h2>Chunk</h2>
<Stats query={{total: true, ...query, key: "chunk%"}}/>
<h2>Media</h2>
<Stats query={{total: true, ...query, key: "media%"}}/>