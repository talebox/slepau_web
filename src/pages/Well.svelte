<script>
	import { slide } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { navigate } from "@deps/routing";
	import { editing_id, db } from "../store";
	import * as s from "./Well.module.scss";
	import Chunk from "../comps/Chunk.svelte";

	export let id = "";

	let root_title;
	let well = [];
	$: well$ = db.subscribeTo("views/well" + (id ? "/" + id : ""), [[], null]);

	$: {
		let [children, root] = $well$;
		well = children;
		root_title = root?.[1].title;
	}
	let selected = undefined;

	const chunk_del = () =>
		db.actions.chunks.del(selected).then(() => (selected = undefined));
</script>

<div class="breadcrumb" in:slide>
	<h1>{root_title ?? "Root"}</h1>
</div>

<div class="container grid-r">
	{#each well as id (id)}
		<div
			class="chunk border"
			class:selected={selected?.includes(id)}
			class:selectable={!!selected}
			animate:flip={{ duration: 500 }}
			on:click={() => {
				if (!selected) return;
				if (selected.includes(id)) selected = selected.filter((v) => v !== id);
				else {
					selected.push(id);
					selected = selected;
				}
			}}
		>
			{#if !selected}
				<div
					class={s.left}
					on:click={() => {
						// navigate(`/chunk/${id}`);
						$editing_id = id;
					}}
				/>
				<div
					class={s.right}
					on:click={() => {
						navigate(`/well/${id}`);
					}}
				/>
			{/if}
			<Chunk {id} />
		</div>
	{/each}
</div>

{#if selected === undefined}
	<button class="new icon fixed" in:slide on:click={db.actions.chunks.new}>
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg>
	</button>
{:else}
	<button class="del icon fixed" in:slide on:click={chunk_del}>
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
			/>
			<path
				fill-rule="evenodd"
				d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
			/>
		</svg>
	</button>
{/if}

<button
	class="select icon fixed"
	in:slide
	on:click={() => (selected = selected ? undefined : [])}
>
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"
		/>
		<path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
	</svg>
</button>

<slot />

<style>
	.breadcrumb {
		position: fixed;
		background: var(--background-transparent);
		top: 0;
		left: 0;
		height: 100px;
		width: 100vw;
		display: flex;
		flex-flow: row;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: 1;
	}
	.breadcrumb * {
		transition: font-size 0.5s;
	}
	.current {
		font-size: 1.8em;
		font-weight: bold;
	}
	.container {
		padding-top: 100px;
		gap: 20px;
		padding-bottom: 40vh;
		padding-bottom: 40lvh;
	}
	.chunk {
		background: var(--background-alt);
		border-radius: 2em;
		position: relative;
		cursor: pointer;
		padding: 1em;
		white-space: nowrap;
		overflow: hidden;

		min-height: 200px;
		max-height: 270px;
		transition: box-shadow 0.1s;
		outline: var(--border) solid 1px;
	}

	.chunk:hover {
		background: var(--background);
	}
	.chunk.selectable {
		box-shadow: 0 0 0 2px var(--focus);
	}
	.chunk.selected {
		box-shadow: 0 0 0 2px var(--links);
	}

	.new,
	.select,
	.del {
		opacity: 1;
		transition: opacity 1s;
	}
	.new {
		bottom: 0;
		right: 0;
	}
	.select {
		bottom: 0;
		right: var(--button-icon-size);
		border-top-left-radius: 20px;
	}
	.del {
		bottom: 0;
		right: 0;
	}
</style>
