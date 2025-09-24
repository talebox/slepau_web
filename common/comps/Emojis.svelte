<script>
    import { onMount } from 'svelte';
    // import emojis from "./emojis.json";
    import init_search from './emoji_db';
    // If user clicks on emoji, let outer know
    export let on_emoji_selected = () => {};
    export let max = 100;
    // console.log(emojis);
    let filter = '';
    let more = false;
    let emojis_filtered = [];
    let search_input;
    let emoji_search;
    init_search().then((search) => (emoji_search = search));
    $: {
        // const _filtered = Object.entries(emojis).filter(([k, v]) =>
        //     v.name.includes(filter),
        // );
        if (emoji_search && filter.length >= 3) {
            const _filtered = emoji_search(filter);
            more = _filtered.length > max;
            if (more) _filtered.length = max;
            emojis_filtered = _filtered;
        }
    }
    onMount(() => {
        search_input?.focus();
    });
</script>

<div style="display: flex;gap: 8px">
    <input
        bind:this={search_input}
        style="
    background:var(--background);
    border-radius:6px;
    padding:8px;
    padding-inline:12px;
    margin:0;
    flex-grow:3;width:100%"
        placeholder="🔍 Search emoji..."
        bind:value={filter} />
    <slot />
</div>

<div
    style="display: flex;flex-flow:row wrap;font-size: 28px;justify-content:space-between">
    {#each emojis_filtered as {emoji,name}}
        <div class="emoji" title="{name}" on:click={() => on_emoji_selected(emoji)}>
            {emoji}
        </div>
    {/each}
    {#if more}
        <div style="cursor: inherit;">...</div>
    {/if}
</div>

<style>
    .emoji {
        cursor: pointer;
        padding: 6px;
        border-radius: 3px;
    }
    .emoji:hover {
        background: #8882;
    }
    .emoji::selection {
        background: #8884;
    }
</style>
