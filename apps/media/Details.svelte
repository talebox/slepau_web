<!-- Preview/Editor of query parameters and Image metadata -->
<script>
  import { debounce } from "@utils/timeout"
  import Media from "./Media.svelte"
  import { editing_id$, db, make_query, actions } from "./store"
  import { bytes_to_pretty } from "@utils/utils"
  import notifications from "../../common/stores/notifications"
  export let id = undefined

  $: _id = id || $editing_id$

  $: media$ = _id && db.subscribeTo(`media/${_id}`)
  $: media = media$ && $media$
  // $: console.log(media)

  // let dialog
  let query_input
  // $: {
  //   if (dialog && (media ? !dialog.open : dialog.open)) {
  //     media ? dialog.showModal() : dialog.close()
  //   }
  // }

  // $: {
  //   if (media && input) {
  //     // let m = (query = `/media/${media.id}`)
  //     if (input) {
  //       input.value = ``
  //     }
  //   }
  // }

  let query
  // Reset source on false media
  $: query = (media && query) || ""
  function on_query_input(e) {
    debounce(() => {
      query = e.target.value
    }, 2000)
  }
  function on_query_blur(e) {
    query = e.target.value
  }

  function copy_path() {
    navigator.clipboard.writeText(`/media/${media.id}${make_query(query)}`)
    notifications.add("Path copied.")
  }
  let name_input
  $: name = media?.name
  $: {
    if (media && name_input) name_input.value = media.name
  }
</script>

{#if media}
  <div class="container">
    <div style="max-width:800px;margin:auto;position:relative">
      <h1>{name || media.id}</h1>
      {#if name}
        <p><b style="margin-block:1em">{media.id}</b></p>
      {/if}
      <button
        style="position:absolute;top:0;right:0"
        on:click={() => ($editing_id$ = undefined)}>Close</button
      >

      <div class="original">
        <div style="position: relative;min-height:300px;">
          <Media {media} />
        </div>
        <div>
          <label>
            Name: <input
              placeholder="A name"
              bind:this={name_input}
              on:input={(e) => {
                name = e.target.value
                if (!media) return
                debounce(
                  () => actions.media.patch({ id: media.id, name }),
                  200,
                  media.id
                )
              }}
            />
          </label>
          <br />

          <details>
            <summary>
              <b>Meta</b>
              <code
                >{media.meta.type}
                <b>{bytes_to_pretty(media.meta.size)}</b></code
              >
            </summary>
            <code>
              hash: {media.meta.hash}<br />
              size: {media.meta.size}<br />
              type: {media.meta.type}<br />
            </code>
          </details>
          <details open>
            <summary>
              <b>Versions</b>
              <code
                >count: {Object.values(media.versions).length}, hits: {Object.values(
                  media.versions
                ).reduce((a, v) => a + v.count, 0)}</code
              >
            </summary>
            {#each Object.entries(media.versions) as [version, info] (version)}
              <div>
                <code>{version}</code>
                {info.meta.type}
                <b>{info.time.toFixed(1)}s {bytes_to_pretty(info.meta.size)}</b>
              </div>
            {/each}
          </details>
        </div>
      </div>
      <hr />
      <h2>Query Editor</h2>
      <div class="original">
        <div style="position: relative;height:inherit;min-height:300px;">
          <Media {media} {query} />
        </div>
        <div>
          <label>
            Query:
            <input
              bind:this={query_input}
              on:blur={on_query_blur}
              placeholder="max=100"
            />
          </label><br />
          <button on:click={copy_path}>Copy Path</button>
          <p>
            You can test query parameters here.<br />
            This is really only something for development, but if you're feeling
            up to it, go right ahead 🙃.
          </p>
          <p>
            Keep in mind have to chain properties with <code>&</code>. Like you
            would on a normal query.
          </p>
          <p>
            For more details take a look at specs for <a
              href="https://url.spec.whatwg.org/">URL</a
            >
            and <a href="https://www.ietf.org/rfc/rfc3986.txt">URI</a>, and/or
            <a href="https://github.com/talebox/slepau">our code</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .original {
    /* height: 400px; */
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 799px) {
    .original {
      grid-template-columns: 1fr 1fr;
    }
  }
  .container {
    position: fixed;
    top: -2px;
    left: -2px;
    height: calc(100% + 4px);
    width: 100%;
    z-index: 2;
    overflow-y: auto;
    background: var(--background-body);
  }
  input {
    width: 100%;
  }
</style>
