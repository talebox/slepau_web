<script>
  import button_icon from "bundle-text:@icons/chevron-right.svg"
  import theme_dark from "bundle-text:@icons/circle.svg"
  import theme_light from "bundle-text:@icons/circle-fill.svg"
  import { theme_set, theme_get } from "~/src/styles/theme/theme.js"
  import { fade, fly } from "svelte/transition"
  let is_light = theme_get()
  const theme_toggle = () => {
    console.log("Was ", is_light)
    is_light = !is_light
    console.log("Setting ", is_light)
    theme_set(is_light)
  }

  let open = false
</script>

<button class="toggle" on:click={() => (open = !open)}>
  {@html button_icon}
</button>

{#if open}
  <div
    class="back"
    transition:fade={{ duration: 300 }}
    on:click={() => (open = false)}
  />
  <div class="container" transition:fly={{ duration: 500, x: -200 }}>
    <button on:click={() => (open = false)}>Close</button>
    <div style="flex-grow: 1;" />

    <div style="flex-grow: 1;" />
    <div class="fr">
      <button style="flex-grow:1" on:click={() => (open = false)}>Close</button>
      <button on:click={theme_toggle}
        ><span style="flex-grow:1"
          >{@html is_light ? theme_light : theme_dark}</span
        ></button
      >
    </div>
  </div>
{/if}

<style>
  .back,
  .container {
    position: fixed;
    top: 0;
    left: 0;
  }
  .container {
    padding: 10px;
    width: 200px;
		height: 100vh;
    height: 100dvh;
		/* padding-bottom: calc(100lvh -); */
    background: var(--background-transparent);
    backdrop-filter: blur(5px);

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;

    gap: 10px;
		z-index: 5;
  }
  .back {
    width: 100vw;
    height: 100vh;
    background: var(--background-transparent);
  }

  .toggle {
    position: fixed;
    bottom: 0;
    left: 0;

    padding: 5px;
    margin: 0;

    width: 50px;
    height: 50px;

    border-radius: 0;
    border-top-right-radius: 20px;
  }
</style>
