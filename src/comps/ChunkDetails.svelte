<script>
	import { onDestroy } from "svelte";
	import { db } from "../store";
	import { passed_since_pretty } from "../utils/utils";

	export let id;
	$: chunk$ = id ? db.subscribeTo(`chunks/${id}`) : undefined;
	$: chunk = chunk$ ? $chunk$ : undefined;

	$: modified = chunk?.modified;
	$: created = chunk?.created;

	let mstring;
	let cstring;
	let clear;
	function update(modified, created) {
		clearTimeout(clear);
		const m_d = passed_since_pretty(modified),
			m_c = passed_since_pretty(created);
		if (m_d && m_c) {
			const [v_d, delay_ms_d] = m_d;
			const [v_c, delay_ms_c] = m_c;
			mstring = v_d;
			cstring = v_c;
			const delay_ms = Math.min(delay_ms_d, delay_ms_c);
			// if (process.env.NODE_ENV === "development") {
			// 	console.log("Delaying ", delay_ms);
			// }
			clear = setTimeout(() => update(modified, created), delay_ms);
		}
	}
	$: update(modified, created);
	onDestroy(() => clearTimeout(clear));

	$: values = Object.entries({
		...chunk,
		created: cstring,
		modified: mstring,
	});
</script>

<table class="table">
	<tbody>
		{#each values as [k, v]}
			{#if typeof v === "string"}
				<tr><th>{k}: </th><td>{v}</td></tr>
			{/if}
		{/each}
	</tbody>
</table>

<style>
	.table {
		font-size: 0.9em;
		margin-block: 8px;
	}
	.table td,
	.table th {
		padding: 1px;
	}
	.table th {
		text-align: right;
	}
	.table tr {
		background: none;
	}
</style>
