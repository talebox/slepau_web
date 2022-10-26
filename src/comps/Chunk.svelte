<script>
	import "./Chunk.css";
	import { mdToHtml } from "../utils/commonmark";
	import { db } from "../store";

	export let id = undefined;

	$: chunk$ = id ? db.subscribeTo(`chunks/${id}`) : undefined;
	$: chunk = $chunk$;
</script>

{@html chunk?.value ? mdToHtml(chunk.value) : ""}
