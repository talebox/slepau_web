<script>
	import { onDestroy } from "svelte";
	import { db } from "../store";
	import { passed_since_pretty } from "@utils/utils";
    import UserPhotos from "./UserPhotos.svelte";

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
			{#if ["string"].includes(typeof v)}
				<tr><th>{k} </th><td>{v}</td></tr>
			{/if}
		{/each}
	</tbody>
</table><div style="display: flex; justify-content:space-evenly;">
	<div title="Parents">
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
			/>
		</svg>
		{chunk?.parents}
	</div>
	<div title="Children">
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
			/>
		</svg>
		{chunk?.children}
	</div>
</div><div class="photos">
	<UserPhotos {chunk}/>
</div>

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
	.photos{
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin: auto;
		margin-block: 12px;
	}
</style>
