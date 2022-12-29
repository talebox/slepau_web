<script>
	import { db } from "../store";
	import { chunkValueToHtml } from "../utils/formatting";

	export let id = undefined;

	$: value$ = id ? db.subscribeTo(`chunks/${id}/value`) : undefined;
	let value$;
	$: value = value$ ? $value$ : undefined;
	$: preview = (value && chunkValueToHtml(value)) || undefined;
</script>

{#if preview}
	<div class="page">
		{@html preview}
	</div>
{:else}
	<h1>Chunk not available</h1>
	Check that the owner has at least allowed read access by public<code
		>share: public read</code
	>
{/if}
