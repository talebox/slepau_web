<script>
	import SelectedButtons from "@comps/SelectedButtons.svelte";
	import { actions, db, editing_id$ } from "./store";
	import { flip } from "svelte/animate";
	import Media from "./Media.svelte";
	import Loading from "@comps/Loading.svelte";

	let medias = [],
		medias_done = { before: false, after: false };
	let incoming = db.subscribeTo("views/all/paged", {
		request_on: "subscription",
	});

	$: {
		if ($incoming) {
			console.log($incoming);
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
	$: console.log(medias);

	let selected;

	function add_media() {
		if (!this.files.length) {
			console.log("no files selected");
			return;
		}
		const files = Array.from(this.files);
		actions.media.post_many(files);
	}
	$: console.log(selected);

	let file_input;
	function on_add() {
		file_input?.click();
	}
	function on_remove() {
		actions.media.remove_many(selected);
		selected = undefined;
	}

	function on_click(media) {
		if (selected) {
			if (selected.includes(media.id)) {
				selected = selected.filter((id) => id !== media.id);
			} else {
				selected = [...selected, media.id];
			}
		} else {
			$editing_id$ = media.id;
		}
	}

	let fetching_after, fetching_before;
	function on_scroll() {
		let documentHeight = document.body.scrollHeight;
		let currentScroll = window.scrollY + window.innerHeight;
		// When the user is [modifier]px from the bottom, fire the event.
		let modifier = 30;
		if (
			currentScroll + modifier > documentHeight &&
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

<svelte:window on:scroll={on_scroll} />

{#if process.env.NODE_ENV === "development"}
	<button
		on:click={() => {
			actions.media.remove_many(medias.map((v) => v.id));
			selected = undefined;
		}}>RemoveAll</button
	>
{/if}

<input
	bind:this={file_input}
	on:change={add_media}
	type="file"
	style="display:none;"
	multiple
/>

<div class="grid-r">
	{#each medias as media (media.id)}
		<div
			class="element {selected
				? selected.includes(media.id)
					? 'selected'
					: 'selectable'
				: 'clickable'}"
			animate:flip={{ duration: 500 }}
			on:click={() => {
				on_click(media);
			}}
		>
			<Media
				{media}
				query="type=image/webp&max=500_2"
				width="300"
				height="300"
			/>
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

<SelectedButtons bind:selected {on_add} {on_remove} />

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
	.clickable {
		cursor: pointer;
	}
	.clickable:hover{
		outline: 1px solid var(--selection);
	}
	.element {
		position: relative;
		height: 300px;
		max-width: 300px;
	}
</style>
