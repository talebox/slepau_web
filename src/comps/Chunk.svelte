<script>
	import "./Chunk.css";
	import { mdToHtml } from "../utils/commonmark";
	import { db } from "../store";
    import { REGEX_TITLE } from "../utils/utils";

	export let id = undefined;

	$: chunk$ = id ? db.subscribeTo(`chunks/${id}`) : undefined;
	$: chunk = $chunk$;
	$: value = chunk?.value.replace(REGEX_TITLE, (m, p1, p2) => `# ${p1} `);
</script>

{#if value}
	{@html mdToHtml(value)}
	<slot {chunk} />
{/if}
