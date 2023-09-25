<script>
    import Chunks from "../comps/Chunks.svelte";
    import * as s from "./Well.module.scss";
    import { debounce } from "@utils/timeout";
    import { actions, editing_id$ } from "../store";
    import { navigate } from "@deps/routing";
    import Loading from "@comps/Loading.svelte";

    let showing = false;
    let filter = "";
    let input;
    let chunks = Promise.resolve([]);
    $: {
        if (input) {
            input.focus();
            input.select();
        }
    }

    function on_keydown(e) {
        // User pressed Control/Meta + F
        if (e.keyCode == 70 && (e.ctrlKey || e.metaKey)) {
            // Don't open search window
            e.preventDefault();
            showing = true;
        }
        if (e.key === "Escape") {
            showing = false;
        }
    }

    function refresh() {
        if (!filter.length) return;
        chunks = actions.chunks.search(filter);
    }

    refresh();
    $: {
        debounce(() => refresh(filter), 1000);
        if (!filter.length) chunks = Promise.resolve([]);
    }
</script>

<svelte:window on:keydown={on_keydown} />

{#if showing}
    <div class="container">
        <input
            bind:this={input}
            bind:value={filter}
            placeholder="🔍 Search chunks..."
        />

        {#await chunks}
            <div style="text-align: center;">
                <Loading />
            </div>
        {:then chunks}
            {#if chunks?.length}
                <Chunks {chunks} let:chunk>
                    <div class="clickable">
                        <div
                            class={s.left}
                            on:click|stopPropagation={() => {
                                $editing_id$ = chunk.id;
                                showing = false;
                            }}
                        />
                        <div
                            class={s.right}
                            on:click|stopPropagation={() => {
                                navigate(`/app/well/${chunk.id}`);
                                showing = false;
                            }}
                        />
                    </div>
                </Chunks>
            {:else}
                <div
                    style="text-align: center; padding:8px; border-radius: 8px; border: 1px dashed #7777"
                >
                    Results are empty...<br />
                    You can also use a regex pattern to search. {";)"}
                </div>
            {/if}
        {/await}
    </div>
{/if}

<button
    class="toggle icon fixed"
    title="Toggle Search"
    on:click={() => (showing = !showing)}
>
    <svg fill="currentColor" viewBox="0 0 16 16">
        <path
            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
        />
    </svg>
</button>

<style>
    .container {
        overflow-y: auto;
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: var(--background-body);
        display: flex;
        flex-direction: column;
        gap: 1em;
        padding: 2em;
        z-index: 5;
    }
    input {
        background: var(--background);
        border-radius: 6px;
        padding: 8px;
        padding-inline: 12px;
        margin: 0;
    }

    .toggle {
        z-index: 5;

        bottom: 128px;
        left: 0;
        border-radius: 0;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }
</style>
