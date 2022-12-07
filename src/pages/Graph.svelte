<script>
	import { slide } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { navigate } from "@deps/routing";
	import { db, editing_id, zoom } from "../store";
	import SelectedButtons from "../comps/SelectedButtons.svelte";
	import "./ChunkPage.scss";

	// VVVVV This is Common to Views VVVVV
	export let id = "";

	const root = { id: "", title: "Root" };
	let nodes = [],
		parents = [root];
	$: view$ = db.subscribeTo("views/graph" + (id ? "/" + id : ""), {
		init: null,
	});

	$: {
		if ($view$) {
			let [nodes_incoming, parents_incoming] = $view$;
			nodes = nodes_incoming;
			parents = [...parents_incoming, root];
		}
	}
	let selected = undefined;

	const on_delete = () =>
		db.actions.chunks.del(selected).then(() => (selected = undefined));
	const on_new = () => {
		db.actions.chunks.new(`# New Chunk${id ? ` -> ${id}` : ""}\n\n`);
	};
	const on_click = (node) => {
		if (!node) return;
		if (selected) {
			if (!node.id) return;
			if (selected.includes(node.id))
				selected = selected.filter((v) => v !== node.id);
			else {
				selected.push(node.id);
				selected = selected;
			}
		} else {
			const id = node.id === "" ? "./" : node.id;
			navigate(id, { state: id });
		}
	};
	// ^^^^ This is Common to Views ^^^^

	function offset_to_em(v) {
		return `${v > 0 ? "+" : "-"} ${Math.abs(v)}em`;
	}

	function child_offset(nodes, zoom, index, [x, y] = [0, 0]) {
		const size = nodes?.length || 0;

		const radians =
			(0.5 /* So we start at top ^ */ + (2 / size) * index) * Math.PI;
		let m = 8 + size * 0.9;
		// m = m ;
		x += Math.cos(radians) * m;
		y += Math.sin(radians) * m;
		return [x, y].map(v => v*zoom);
	}
	function parent_offset(nodes, index, [x, y] = [0, 0]) {
		const size = nodes?.length || 0;

		const height = 4;
		x += 0;
		y += -(((size - 1) * height) / 2) + index * height;
		return [x, y];
	}

	function flatten_nodes(nodes,zoom, depth = 0, offset = [0, 0]) {
		if (!nodes?.length) return [];
		return nodes.flatMap(([n, c], index) => {
			let o = child_offset(nodes, zoom, index, offset).map((v) => v);
			return [...[{ ...n, o }], ...flatten_nodes(c, zoom, depth + 1, o)];
		});
	}
	// turn
	$: nodes_flat = [
		flatten_nodes(nodes, $zoom),
		parents.map((p, index) => ({ ...p, o: parent_offset(parents, index) })),
	].flat();
	// $: console.log(nodes_flat);
</script>

<div class="container">
	{#each nodes_flat as node (node.id)}
		<div
			class="node"
			class:selected={selected?.includes(node.id)}
			class:selectable={!!selected && node.id}
			transition:slide
			animate:flip={{ duration: 500 }}
			style={`left: calc(50% ${offset_to_em(
				node.o[0]
			)}); bottom: calc(50% ${offset_to_em(node.o[1])}`}
			on:click={() => on_click(node)}
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
			<div class="content">{node.title}</div>
		</div>
	{/each}

	<div class="side-actions">
		<button
			class="action icon"
			on:click={() => {
				$zoom += 0.1;
			}}
		>
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path
					d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
				/>
			</svg>
		</button>
		<button
			class="action"
			on:click={() => {
				$zoom -= 0.1;
			}}
		>
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
			</svg>
		</button>
	</div>
</div>

<SelectedButtons bind:selected {on_new} {on_delete} />

<slot />

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

		transition: transform 300ms;
		text-align: center;
		overflow: hidden;
		display: flex;
		align-items: stretch;
		transform: translate(-50%, -50%);
		/* padding: 16px; */
	}
	.content {
		padding: 16px;
	}
	.node:hover {
		background: var(--background);
		transform: translate(-50%, -50%) translateY(-1px);
	}
	/* .parent {
		opacity: 0.7;
	} */
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
