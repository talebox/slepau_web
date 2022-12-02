<script>
	import { slide, fade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { navigate } from "@deps/routing";
	import { editing_id, db } from "../store";
	import SelectedButtons from "../comps/SelectedButtons.svelte";
	import * as s from "./Well.module.scss";
	import Chunk from "../comps/Chunk.svelte";
	import "./ChunkPage.scss";

	export let id = "";

	const root = { id: "", title: "Root" };
	let nodes = [],
		parents = [root];
	$: view$ = db.subscribeTo("views/well" + (id ? "/" + id : ""), {
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
</script>

<div class="breadcrumb" in:slide>
	{#if id}
		<button on:click={() => history.back()} class="back">
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path
					fill-rule="evenodd"
					d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
				/>
			</svg>
		</button>
	{/if}
	{#if parents.length}
		{#each parents.reverse() as parent, i (parent.id)}
			{#if i === parents.length - 1}
				<h1 in:slide>{parent.title}</h1>
			{:else}
				<h3
					in:slide
					style="cursor:pointer;"
					on:click={() => {
						on_click(parent);
					}}
				>
					{parent.title}
				</h3>
				<hr style="width: 1em;" />
			{/if}
		{/each}
	{:else}
		<h1>Root</h1>
	{/if}
</div>

<div class="container chunk-container grid-r" style="gap: 20px">
	{#each nodes as id (id)}
		<div
			class="chunk border"
			class:selected={selected?.includes(id)}
			class:selectable={!!selected}
			animate:flip={{ duration: 500 }}
			on:click={() => on_click({ id })}
		>
			{#if !selected}
				<div class={s.left} />
				<div
					class={s.right}
					on:click|stopPropagation={() => {
						navigate(id);
					}}
				/>
			{/if}
			<Chunk {id} />
		</div>
	{/each}
</div>

<SelectedButtons bind:selected {on_new} {on_delete} />

<slot />

<style>
	.back {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		border-radius: 0;
	}
	.breadcrumb {
		position: fixed;
		background: var(--background-transparent);
		top: 0;
		left: 0;
		height: 70px;
		/* padding-block: 1em; */
		gap: 0.4em;
		width: 100vw;
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: 1;
	}
	.breadcrumb > * {
		margin: 0;
	}
	.breadcrumb * {
		transition: font-size 0.5s;
	}
	.current {
		font-size: 1.8em;
		font-weight: bold;
	}
	.container {
		padding-top: 70px;
	}
</style>
