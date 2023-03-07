<script>
	import "./Chunk.css";
	import { chunkValueToHtml } from "@utils/formatting";
	import { db } from "../store";

	export let id = undefined;
	export let chunk = undefined;

	$: chunk$ = id
		? db.subscribeTo(`chunks/${id}`, { request_on: "undefined" })
		: undefined;
	$: chunk = $chunk$;
</script>

{#if chunk?.value}
	{@html chunkValueToHtml(chunk.value)}
	<slot {chunk} />
{/if}
