<script>
	import { navigate } from "@deps/routing";
	import Loading from "../comps/Loading.svelte";
	import { chunkValueToHtml } from "@utils/formatting";
	import { fetchE } from "@utils/network";

	let preview = fetchE("/api/chunks/")
		.then((v) => v.json())
		.then((v) => chunkValueToHtml(v.value));
</script>

{#await preview}
	<div style="text-align: center;">
		<Loading size="64px" />
	</div>
{:then preview}
	<div class="page">
		{@html preview}
	</div>
{/await}
