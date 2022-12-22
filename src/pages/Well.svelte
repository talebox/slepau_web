<script>
	import { slide, fade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { navigate } from "@deps/routing";
	import { editing_id, db } from "../store";
	import SelectedButtons from "../comps/SelectedButtons.svelte";
	import * as s from "./Well.module.scss";
	import Chunks from "../comps/Chunks.svelte";
	import { setContext } from "svelte";
	import { seconds_to_short } from "../utils/utils";

	// VVVVV This is Common to Views VVVVV
	export let id = "";

	const root = { id: "", props: { title: "Root" } };
	let nodes = [],
		parents = [root];
	$: view$ = db.subscribeTo("views/well" + (id ? "/" + id : ""), {
		init: null,
	});

	$: {
		if ($view$) {
			let [id, children] = $view$;
			parents = id ? [id, root] : [root];
			nodes = children;
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

	setContext("view_type", "well");
	// ^^^^ This is Common to Views ^^^^
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

	{#each parents.reverse() as parent, i (parent.id)}
		<div
			in:slide
			animate:flip={{ duration: 500 }}
			style={`cursor:pointer;padding-right:.5em`}
			style:font-size={i === parents.length - 1 ? "1.6em" : "1em"}
			style:border-right={i === parents.length - 1
				? "initial"
				: "1px solid #8888"}
			on:click={() => {
				on_click(parent);
			}}
		>
			{parent.props?.title ??
				"<" + seconds_to_short(parent?.props_dynamic?.modified) + ">"}
		</div>
	{/each}
</div>

<div class="container">
	<Chunks chunks={nodes.map((v) => v[0])} {selected} let:chunk>
		<div class="clickable" on:click={() => on_click(chunk)}>
			{#if !selected}
				<div
					class={s.left}
					on:click|stopPropagation={() => {
						$editing_id = chunk.id;
					}}
				/>
				<div class={s.right} />
			{/if}
		</div>
	</Chunks>
</div>

<SelectedButtons bind:selected {on_new} {on_delete} />

<slot />

<style>
	.clickable {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
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
		gap: 0.7em;
		width: 100vw;
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: 1;
	}
	/* To disable blurring on slow mobile devices */
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(5px)) {
			.breadcrumb {
				backdrop-filter: blur(8px);
			}
		}
	}
	.breadcrumb > * {
		margin: 0;
	}
	.breadcrumb * {
		transition: font-size 0.5s;
	}
	.container {
		padding-top: 70px;
	}
</style>
