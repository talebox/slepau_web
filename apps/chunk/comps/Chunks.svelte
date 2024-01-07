<script>
	import "./Chunk.css";
	import { flip } from "svelte/animate";
	import { fade } from "svelte/transition";
	export let selected = undefined;
	export let chunks = [];
	import ChunkCard from "./ChunkCard.svelte";
</script>

<div class="chunk-container">
	<div style="gap: 20px;" class="grid-r">
		{#if Array.isArray(chunks)}
			{#each chunks as chunk (chunk?.id)}
				<div
					class="chunk"
					animate:flip={{ duration: 500 }}
				>
					<ChunkCard
						{chunk}
						selected={selected?.includes(chunk?.id)}
						selectable={!!selected}
					>
						<slot {chunk} />
					</ChunkCard>
				</div>
			{/each}
		{/if}
	</div>
	<slot name="footer" />
</div>

<style>
	.chunk-container {
		padding-bottom: 40vh;
		padding-bottom: 40lvh;
	}
	.chunk {
		min-height: 200px;
		max-height: 270px;
		position: relative;
	}
</style>
