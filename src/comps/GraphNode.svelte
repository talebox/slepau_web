<script>
	import { draw, fade, slide } from "svelte/transition";
	import { editing_id, zoom } from "../store";

	export let node = [null, null];
	export let offset = [0, 0];
	export let level = 0;
	export let parents = null;
	export let selected;
	$: root = !!parents;

	// let _zoom = ;

	export let on_click;
	$: [node, children] = node;
	function child_offset(child, index) {
		const size = children?.length || 0;
		let [x, y] = offset;
		const radians =
			(0.5 /* So we start at top ^ */ + (2 / size) * index) * Math.PI;
		let m = 8 + size * 0.9;
		// m = m ;
		x += Math.cos(radians) * m;
		y += Math.sin(radians) * m;
		return [x, y];
	}
	function offset_to_em(v) {
		return `${v > 0 ? "+" : "-"} ${Math.abs(v)}em`;
	}
</script>

<div
	class="node-container"
	style={`left: calc(50% ${offset_to_em(
		offset[0]
	)}); bottom: calc(50% ${offset_to_em(offset[1])}`}
>
	{#if parents}
		{#each parents.reverse() as parent, index (parent.id)}
			<div class="node parent" on:click={() => on_click(parent)}>
				<div class="content">
					{parent.title}
				</div>
			</div>
		{/each}
	{/if}

	<div
		class="node"
		class:root
		on:click={() => on_click(node)}
		class:selected={selected?.includes(node.id)}
		class:selectable={!!selected}
		in:slide
	>
		{#if node.id}
			<div
				class="edit"
				on:click|stopPropagation={() => {
					$editing_id = node.id;
				}}
			>
				<svg fill="currentColor" viewBox="0 0 16 16" class="icon">
					<path
						d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"
					/>
				</svg>
			</div>
		{/if}
		<div class="content">
			<b>{node?.title}</b>
		</div>
	</div>
</div>

{#if children}
	{#each children as node, index (node[0].id)}
		<svelte:self
			{node}
			offset={child_offset(node, index).map((v) => v * $zoom)}
			level={level + 1}
			{on_click}
			{selected}
		/>
	{/each}
{/if}

<style>
	.node-container {
		position: absolute;
		/* left: 50%;
		top: 50%; */
		gap: 0.5em;
		transform: translate(-50%, 40%);
		display: flex;
		flex-flow: column;
	}
	.node {
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
	}
	.content {
		padding: 16px;
	}
	.node:hover {
		background: var(--background);
		transform: translateY(-2px);
	}
	.parent {
		opacity: 0.7;
	}
	.icon {
		width: 1em;
		/* height: 1em; */
	}
	.edit {
		/* background: var(--background); */
		border-right: 1px solid #8888;
		opacity: 0.5;
		padding-inline: 0.8em;
		display: flex;
		align-items: center;
	}
	.edit:hover {
		/* background: var(--background-alt); */
		opacity: 1;
	}
</style>
