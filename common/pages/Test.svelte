<script>
	import { slide } from "svelte/transition";
	import { flip } from "svelte/animate";
	let nodes = [
		{ id: "a", o: [0, 0] },
		{ id: "b", o: [0, 10] },
	];
	const nodes2 = [
		{ id: "b", o: [0, 0] },
		{ id: "c", o: [0, 10] },
	];
	function offset_to_em(v) {
		return `${v > 0 ? "+" : "-"} ${Math.abs(v)}em`;
	}
</script>

<div class="container">
	{#each nodes as node (node.id)}
		<div
			class="node"
			transition:slide
			animate:flip
			style={`left: calc(50% ${offset_to_em(
				node.o[0]
			)}); bottom: calc(50% ${offset_to_em(node.o[1])}`}
			on:click={() => (nodes = nodes2)}
		>
			{node.id}
		</div>
	{/each}
	<div />
</div>

<style>
	.container {
		position: fixed;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
	}
	.node {
		position: absolute;
		cursor: pointer;

		border-radius: 10px;
		background: var(--background-alt);
		/* transform-origin: center; */

		transition: transform 300ms;
		/* width: 5em;
		height: 5em; */
		min-width: 10em;
		/* max-width: 6em; */

		/* max-height: 4em; */
		/* width: min-content; */
		text-align: center;
		overflow: hidden;
		display: flex;
		align-items: stretch;
		/* white-space: nowrap; */
		padding: 16px;
	}
</style>
