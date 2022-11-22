<script>
	import { flip } from "svelte/animate";
	import Chunk from "./Chunk.svelte";
	export let selected = undefined;
	export let chunks = [];
</script>

<div class="chunk-container">
	<div style="gap: 20px;" class="grid-r">
		{#if Array.isArray(chunks)}
			{#each chunks as id (id)}
				<div
					class={"chunk border "}
					class:selected={selected?.includes(id)}
					class:selectable={!!selected}
					animate:flip={{ duration: 500 }}
				>
					<Chunk {id} let:chunk>
						<slot {chunk} />
					</Chunk>
				</div>
			{/each}
		{/if}
	</div>
	<slot name="footer" />
</div>
