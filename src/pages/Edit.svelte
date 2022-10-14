<script>
  import { slide, fly, fade } from "svelte/transition"
  import { useDelay } from "../utils/timout"
  import { chunks, preview_show, is_phone } from "../store"
  import { navigate } from "svelte-routing"
  import { mdToHtml } from "../utils/commonmark"

  export let created

  $: [chunk, chunk$] = $chunks?.[created] ?? [undefined, undefined]

  $: preview_always = !$is_phone
  // Update preview if enabled
  let preview
  $: preview =
    ($preview_show || preview_always) && $chunk$?.value
      ? mdToHtml($chunk$.value)
      : preview
</script>

<!-- <svelte:window
  on:resize={() =>
    (preview_always = )}
/> -->
<div class="container">
  {#if $chunk$}
    <textarea class="edit" bind:value={$chunk$.value} />
  {:else}
    Bad chunk
  {/if}
  {#if preview && ($preview_show || preview_always)}
    <div class="preview">{@html preview}</div>
  {/if}
  <button class="close icon" on:click={() => navigate("/")}>
    <svg fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
      />
    </svg>
  </button>
  {#if !preview_always}
    <button
      class="preview-btn icon"
      on:click={() => ($preview_show = !$preview_show)}
    >
      {#if $preview_show}
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"
          />
          <path
            d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
          />
        </svg>
      {:else}
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM2.5 6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4Zm0 2a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4Z"
          />
          <path
            d="M0 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1H5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1 2 2 0 0 1-2-2V6Zm2-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H2Z"
          />
        </svg>
      {/if}
    </button>
  {/if}
</div>

<!-- <div></div> -->
<style>
  .container {
    background: var(--background-body);
    position: absolute;
    position: fixed;
    top: 0;
    left: 0;
    /* height: calc(100vh - 40px);
    height: calc(100svh - 40px); */
    height: 100vh;
    height: 100dvh;
    width: 100%;
    z-index: 1;
    overflow-y: visible;
  }

  .edit,
  .preview {
    background: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--background-body);
    overflow-y: auto;
    padding-bottom: 30em;
  }
  /* .preview{
	} */
  .edit {
    resize: none;
    border-radius: 0;
  }
  .edit:focus {
    box-shadow: none;
  }

  
  .close,
  .preview-btn {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
    width: var(--button-icon-size);
    height: var(--button-icon-size);
    border-radius: 0 6px 0 24px;
  }
	.close {
    border-top-right-radius: 0;
  }
  .preview-btn {
    top: unset;
    bottom: 0;
    border-radius: 24px 0 6px;
  }

  @media (min-width: 768px) {
    .preview,
    .edit {
      width: 50%;
      background: unset;
    }
    .preview {
      left: 50%;
    }
    @supports (backdrop-filter: blur(5px)) {
      .container {
        background: var(--background-transparent);
        backdrop-filter: blur(5px);
      }
    }
  }
</style>
