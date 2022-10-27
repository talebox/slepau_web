<script>
  import {
    theme_set,
    theme_get,
    prefers_light,
  } from "~/src/styles/theme/theme.js"
  import { fade, fly } from "svelte/transition"
	import {navigate} from '@deps/routing'

  let is_light = theme_get()

  const theme_toggle = () => {
    console.log("Was ", is_light)
    // Small state machine
    is_light =
      is_light === undefined
        ? !prefers_light
        : is_light === !prefers_light
        ? prefers_light
        : undefined
    console.log("Setting ", is_light)
    theme_set(is_light)
  }

  let open = false
</script>

<button class="toggle icon fixed" on:click={() => (open = !open)}>
  <svg
    
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      fill-rule="evenodd"
      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
    />
  </svg>
</button>

{#if open}
  <div class="back" on:click={() => (open = false)} />
  <div class="container">
    <button on:click={() => (open = false)}>Close</button>
    <div style="flex-grow: 1;" />
    <button on:click={() => navigate("/chunks/")}>Chunks</button>
		<button on:click={() => navigate("/well/")}>Well</button>
		<button on:click={() => navigate("/login")}>Login</button>
    <div style="flex-grow: 1;" />
    <div class="fr">
      <button style="flex-grow:1" on:click={() => (open = false)}>Close</button>
      <button on:click={theme_toggle}
        ><span style="flex-grow:1">
          {#if is_light === true}
            <svg
              
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
              />
            </svg>
          {:else if is_light === false}
            <svg
              
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <circle cx="8" cy="8" r="8" />
            </svg>
          {:else}
            <svg
              
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"
              />
            </svg>
          {/if}
        </span></button
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
		z-index: 6;
  }
  .container {
    padding: 10px;
    width: 300px;
    height: 100vh;
    height: 100dvh;
    /* padding-bottom: calc(100lvh -); */
		
    background: var(--background-transparent);
    backdrop-filter: blur(5px);

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;

    gap: 10px;
    
  }
  .back {
    width: 100vw;
    height: 100vh;
    background: var(--background-transparent);
		/* z-index: 0; */
  }

  .toggle {
    z-index: 5;

    bottom: 0;
    left: 0;
    border-top-right-radius: 20px;
  }
</style>
