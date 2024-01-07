<script>
	/** Major difference here is selected will be of the
	 * entire media object, not just the id*/
	import { db } from "../../apps/media/store";
	import { flip } from "svelte/animate";
	import Media from "../../apps/media/Media.svelte";
	import Loading from "@comps/Loading.svelte";

	export let selected = [];

	let medias = [],
		medias_done = { before: false, after: false };
	let incoming = db.subscribeTo("views/all/paged", {
		request_on: "subscription",
	});

	$: {
		if ($incoming) {
			const {
				query: { cursor, limit },
			} = $incoming;
			if (cursor) {
				const { before, after } = cursor;
				let id = before ?? after;
				let i = id ? medias.findIndex((v) => v.id === id) : -1;
				if (i >= 0) {
					if (before) {
						medias.splice(i - limit, limit, ...$incoming.data);
						if ($incoming.data.length < limit) {
							medias_done.before = true;
						}
					} else {
						medias.splice(i, limit, ...$incoming.data);
						if ($incoming.data.length < limit) {
							medias_done.after = true;
						}
					}
					medias = medias;
				}
			} else {
				medias_done = { before: false, after: false };
				medias_done.before = true;
				medias = $incoming.data;
				if ($incoming.data.length < limit) {
					medias_done.after = true;
				}
			}
		}
	}

	function on_click(media) {
		if (selected.includes(media)) {
			selected = selected.filter((m) => m !== media);
		} else {
			selected = [...selected, media];
		}
	}

	let fetching_after, fetching_before;
	/** Let this component know when user has scrolled to bottom */
	export function trigger_new_items() {
		// let documentHeight = document.body.scrollHeight;
		// let currentScroll = window.scrollY + window.innerHeight;
		// When the user is [modifier]px from the bottom, fire the event.
		// let modifier = 30;
		if (
			// currentScroll + modifier > documentHeight &&
			!medias_done.after &&
			!fetching_after
		) {
			console.log("Fetching after");
			fetching_after = true;
			db.send(
				{
					resource: "views/all/paged",
					value: JSON.stringify({
						cursor: { after: medias[medias.length - 1].id },
					}),
				},
				() => (fetching_after = false),
			);
		}
	}

	db.send({ resource: "views/all/paged" });
</script>

<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px">
	{#each medias as media (media.id)}
		<div
			class="element {selected.includes(media) ? 'selected' : 'selectable'}"
			animate:flip
			on:click={() => {
				on_click(media);
			}}
		>
			<Media {media} query="max=500_2&type=image/webp" width="300" height="300" />
		</div>
	{/each}
</div>

{#if !medias_done.after}
	{#if fetching_after}
		<div class="scroll-hint">
			<Loading size="48px" />
		</div>
	{:else}
		<div class="scroll-hint">
			---------------------- <br />
			Scroll for more 👇
		</div>
	{/if}
{/if}

<style>
	.scroll-hint {
		margin-block: 1em;
		padding-block: 20vh;
		padding-top: 1em;
		margin: auto;
		text-align: center;
		font-size: 1.4em;
		font-weight: bold;
		/* height: 30vh; */
	}

	.element {
		position: relative;
		height: 300px;
		max-width: 300px;
	}
</style>
