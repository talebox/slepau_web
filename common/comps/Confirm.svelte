<script>
	import Modal from "./Modal.svelte";
	export let action;
</script>

<Modal on_close={() => action(false)}>
	<div class="container">
		<slot />
		<div class="actions">
			<button on:click={() => action(true)}>Yes</button>
			<button on:click={() => action(false)} select>No</button>
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
