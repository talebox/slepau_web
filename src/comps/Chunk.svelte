<script>
	import "./Chunk.css";
	import { chunkValueToHtml } from "../utils/formatting";
	import { db } from "../store";

	export let id = undefined;

	$: chunk$ = id ? db.subscribeTo(`chunks/${id}`) : undefined;
	$: chunk = $chunk$;
</script>

{#if chunk?.value}
	{@html chunkValueToHtml(chunk.value)}
	<slot {chunk} />
{/if}
