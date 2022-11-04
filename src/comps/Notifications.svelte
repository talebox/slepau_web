<script>
  import { notifications } from "../store"
  import { slide } from "svelte/transition"
</script>

<div class="container fc">
  {#each Object.values($notifications) as n (n.id)}
    <div class="notification" transition:slide>{n.value}</div>
  {/each}
</div>

<style>
  .container {
    position: fixed;
    z-index: 4;
    left: 0;
    bottom: calc(var(--button-icon-size) + 30px);
    width: 10rem;
    gap: .5em;
    
  }
  .notification {
    border-radius: 5px;
    background: var(--selection);
    padding: 5px;
  }
</style>
