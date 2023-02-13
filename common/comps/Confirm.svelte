<script>
	import Modal from "./Modal.svelte";
	export let action;
	// Should we invert yes/false. Is this a destructive action?
	export let inverted=false;
</script>

<Modal on_close={() => action(false)}>
	<div class="container">
		<slot />
		<div class="actions">
			<button class="bad" on:click={() => action(inverted ? true : false)}>{inverted ? "Yes" : "No"}</button>
			<button class="good" on:click={() => action(inverted ? false : true)} select>{inverted ? "No" : "Yes"}</button>
		</div>
	</div>
</Modal>

<style>
	.container {
		display: flex;
		flex-flow: column;
		align-items: center;
		gap: 1.5em;
	}
	.actions {
		margin-top: 1em;
		display: flex;
		flex-flow: row;
		align-items: center;
		justify-content: space-evenly;
	}
</style>
