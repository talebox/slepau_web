<script>
	import { db, local_settings$ } from "../store";
	import Chunks from "../comps/Chunks.svelte";
	import SelectedButtons from "../comps/SelectedButtons.svelte";
	import { debounce } from "../utils/timout";

	let chunks = db.subscribeTo("views/notes", { init: [] });
	// $: console.log($chunks);
	let chunks_in_viewport = 3;
	let chunks_shown = 0;

	// Making sure if user resizes, more chunks are loaded
	$: if (chunks_shown < chunks_in_viewport) chunks_shown += chunks_in_viewport;
	$: chunks_slice = $chunks?.slice(0, chunks_shown) ?? [];

	function calc_viewport() {
		const chunk_height = 270,
			gap = 20;
		let rows = Math.ceil(window.innerHeight / (chunk_height + gap));

		let cols = 1;

		if (window.matchMedia("(min-width: 92em)").matches) cols = 5;
		else if (window.matchMedia("(min-width: 76rem)").matches) cols = 4;
		else if (window.matchMedia("(min-width: 56rem)").matches) cols = 3;
		else if (window.matchMedia("(min-width: 36rem)").matches) cols = 2;
		// console.log(`Rows :${rows}, cols: ${cols}`);
		chunks_in_viewport = rows * cols;
	}
	function onresize() {
		debounce(
			() => {
				calc_viewport();
			},
			500,
			"cview"
		);
	}
	calc_viewport();

	let scroll_triggered = false;
	function onscroll() {
		if (scroll_triggered) return;

		if (
			window.innerHeight + Math.ceil(window.pageYOffset) >=
			document.body.offsetHeight - 30
		) {
			// console.log("reached end");
			if (chunks_shown < $chunks?.length) chunks_shown += chunks_in_viewport;

			scroll_triggered = true;
			setTimeout(() => (scroll_triggered = false), 100);
		}
	}

	let selected = undefined;

	const on_remove = () =>
		db.actions.chunks.del(selected).then(() => (selected = undefined));
	const on_add = () => {
		db.actions.chunks.new();
	};
	const on_click = (node) => {
		if (!node) return;
		if (selected) {
			if (selected.includes(node.id))
				selected = selected.filter((v) => v !== node.id);
			else {
				selected.push(node.id);
				selected = selected;
			}
		} else {
			$local_settings$.editing_id = node.id;
		}
	};
</script>

<svelte:window on:scroll={onscroll} on:resize={onresize} />
<Chunks chunks={chunks_slice} {selected} let:chunk>
	<div class="clickable" on:click={() => on_click(chunk)} />
	<div slot="footer" style="margin-top: 1em;opacity:0.7;text-align:center;">
		{#if chunks_shown < ($chunks?.length ?? 0)}
			Scroll for more... 🖱️👇
		{:else}
			--- end ---
		{/if}
	</div>
</Chunks>

<SelectedButtons bind:selected {on_add} {on_remove} />

<slot />

<style>
	.clickable {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
</style>
