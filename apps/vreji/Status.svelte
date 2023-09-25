<script>
    import Stats from "./Stats.svelte";
</script>

<h1 style="text-align: center;">Dash</h1>
<h2>Total</h2>
<Stats query={{ total: true }} />
<h2>Auth</h2>
<Stats query={{ key: "auth%", total: true }} />
<h2>Chunk</h2>
<Stats query={{ key: "chunk%", total: true }} />
<h2>Media</h2>
<Stats query={{ key: "media%", total: true }} />
