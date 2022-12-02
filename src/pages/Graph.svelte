<script>
	// import { slide } from "svelte/transition";
	// import { flip } from "svelte/animate";
	import { navigate } from "@deps/routing";
	import { editing_id, db, notifications, zoom } from "../store";
	import SelectedButtons from "../comps/SelectedButtons.svelte";
	import "./ChunkPage.scss";
	import GraphNode from "../comps/GraphNode.svelte";

	export let id = "";

	const root = { id: "", title: "Root" };
	let nodes = [],
		parents = [root];
	$: view$ = db.subscribeTo("views/graph" + (id ? "/" + id : ""), {
		init: [[], []],
	});

	$: {
		let [_nodes, _parents] = $view$;
		nodes = _nodes;
		parents = [..._parents, root];
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

	$: root_node = [parents[0], nodes];
</script>

<div class="container">
	<GraphNode
		node={root_node}
		{on_click}
		parents={parents.slice(1)}
		{selected}
	/>
	<div class="actions">
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
			class="action icon"
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
</style>
