<script>
	import { notifications } from "../stores/notifications";
	import { slide } from "svelte/transition";
</script>

<div class="container fc">
	{#each Object.values($notifications) as n (n.id)}
		<div class={`notification ${n.type}`} transition:slide>{n.value}</div>
	{/each}
</div>

<style>
	.container {
		position: fixed;
		z-index: 4;
		left: 0;
		bottom: calc(var(--button-icon-size) + 30px);
		width: 10rem;
		gap: 0.5em;
	}
	.notification {
		border-radius: 5px;
		background: var(--selection);
		padding: 5px;
	}
	.error {
		background: #f008;
	}
</style>
