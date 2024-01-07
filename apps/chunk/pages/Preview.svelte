<script>
	import { db } from "../store";
	import { chunkValueToHtml } from "@utils/formatting";
	import { get } from "svelte/store";

	export let id = undefined;

	$: value$ = id ? db.subscribeTo(`chunks/${id}/value`) : undefined;
	let value$;
	$: value = value$ ? $value$ : undefined;
	$: preview = (value && chunkValueToHtml(value)) || undefined;

	// Get user info
	let user_info$ = db.subscribeToUser();
	let user_info = get(user_info$);
	$: {
		user_info = $user_info$;
	}

	// Show or hide edit
	let edit_href = false;
	$: {
		edit_href =
			value && user_info && user_info.user !== "public" ? `/app/edit/${id}` : false;
	}
	$: {
		const edit_btn = document.querySelector(".edit-button");
		if (edit_btn) {
			if (edit_href) {
				edit_btn.classList.add("visible");
				edit_btn.href = edit_href;
			} else {
				edit_btn.classList.remove("visible");
			}
		}
	}
</script>

{#if preview}
	<div class="page">
		{@html preview}
	</div>
{:else}
	<h1>Chunk not available</h1>
	<p>
		Check that the owner has at least allowed read access by public
		<code>share: public read</code>.
	</p>
{/if}
