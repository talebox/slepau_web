<script>
	import { slide } from "svelte/transition";
	import { db, editing_id } from "../store";
	import Chunks from "../comps/Chunks.svelte";
	import "./ChunkPage.scss";

	let chunks = db.subscribeTo("chunks", []);

	let selected = undefined;
	const selected_toggle = () => (selected = selected ? undefined : []);

	const chunk_del = () =>
		db.actions.chunks.del(selected).then(() => (selected = undefined));
</script>

<Chunks chunks={$chunks} {selected} let:chunk>
	<div
		class="clickable"
		on:click={() => {
			if (selected) {
				if (selected.includes(chunk.id))
					selected = selected.filter((v) => v !== chunk.id);
				else {
					selected.push(chunk.id);
					selected = selected;
				}
			} else {
				$editing_id = chunk.id;
			}
		}}
	/>
</Chunks>

{#if selected === undefined}
	<button
		class="chunk-new icon fixed"
		in:slide
		on:click={db.actions.chunks.new}
	>
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg>
	</button>
{:else}
	<button class="chunk-del icon fixed" in:slide on:click={chunk_del}>
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

<button class="chunk-select icon fixed" in:slide on:click={selected_toggle}>
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"
		/>
		<path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
	</svg>
</button>

<slot />

<style>
	.clickable {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
</style>
