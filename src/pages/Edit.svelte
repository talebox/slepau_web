<script>
	import { slide } from "svelte/transition";
	import { useDebounce } from "../utils/timout";
	import { db, editing_id, wants_preview, is_phone } from "../store";
	import { chunkValueToHtml } from "../utils/commonmark";
	import { applyDiff } from "../utils/utils";

	export let id = undefined;
	let editor;

	$: _id = id || $editing_id;

	// Clear editor when opening new view
	$: if (_id && editor) editor.value = "";

	$: chunk$ = _id ? db.subscribeTo(`chunks/${_id}`) : undefined;
	$: diff$ = _id
		? db.subscribeTo(`chunks/${_id}/diff`, undefined, false)
		: undefined;
	$: diff = $diff$;
	$: chunk = $chunk$;

	// Set editor value when chunk arrives
	$: {
		if (chunk?.value && editor) {
			// Fill editor if it's empty, or if chunk has a negative no_edit field
			// (used to indicate that it's an update to other UI components and not this one)
			if (!chunk?.no_edit || !editor.value) {
				editor.value = chunk.value;
			}
		}
	}
	// Update editor value when diff arrives, usually an update from another user typing
	$: if (diff && editor?.value) {
		let s = [editor.selectionStart, editor.selectionEnd];
		const [right, _s] = applyDiff(editor.value, diff, s);

		editor.value = right;
		editor.selectionStart = _s[0];
		editor.selectionEnd = _s[1];
	}

	// Update preview if enabled
	$: showing_preview = $wants_preview || !$is_phone;

	// Triggers on chunk.value and showing_preview
	let preview;
	$: {
		if (chunk?.value && showing_preview)
			preview = chunkValueToHtml(chunk.value);
	}

	function close() {
		if (id) {
			window.history.back();
		} else if ($editing_id) {
			$editing_id = undefined;
		}
	}
</script>

{#if chunk}
	<div class="container" style:display={!_id ? "none" : "initial"}>
		{#if chunk}
			<textarea
				class="edit"
				spellcheck="false"
				autocapitalize="off"
				autocorrect="off"
				bind:this={editor}
				on:input={(e) => {
					useDebounce(
						() => db.actions.chunks.put(chunk.id, e.target.value),
						200,
						chunk.id
					);
				}}
			/>
			<div class="preview" class:showing_preview>{@html preview}</div>
		{/if}

		<button class="close icon" on:click={close}>
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path
					d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
				/>
			</svg>
		</button>

		{#if $is_phone}
			<button
				class="preview-btn icon"
				in:slide
				on:click={() => ($wants_preview = !$wants_preview)}
			>
				{#if showing_preview}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"
						/>
						<path
							d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
						/>
					</svg>
				{:else}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM2.5 6a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4Zm0 2a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4Z"
						/>
						<path
							d="M0 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1H5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1 2 2 0 0 1-2-2V6Zm2-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H2Z"
						/>
					</svg>
				{/if}
			</button>
		{/if}
	</div>
{/if}

<!-- <div></div> -->
<style>
	.container {
		/* background: var(--background-body); */
		/* position: absolute; */
		position: fixed;
		top: -2px;
		left: -2px;
		/* height: calc(100vh - 40px);
    height: calc(100svh - 40px); */
		height: calc(100vh + 4px);
		height: calc(100dvh + 4px);
		width: 100%;
		z-index: 2;
		overflow-y: visible;
	}

	.edit,
	.preview {
		background: var(--background-body);
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;

		overflow-y: auto;
		padding-bottom: 30em;
	}

	.preview {
		display: none;
		padding-inline: 1em;
		border-left: 1px solid black;
	}
	.preview.showing_preview {
		display: initial;
	}
	.edit {
		resize: none;
		border-radius: 0;
	}
	.edit:focus {
		box-shadow: none;
	}

	.close,
	.preview-btn {
		position: absolute;
		top: 0;
		right: 0;
		margin: 0;
		width: var(--button-icon-size);
		height: var(--button-icon-size);
		border-radius: 0 6px 0 24px;
	}
	.close {
		border-top-right-radius: 0;
	}
	.preview-btn {
		top: unset;
		bottom: 0;
		border-radius: 24px 0 6px;
	}

	@media (min-width: 768px) {
		.preview,
		.edit {
			width: 50%;
		}
		.preview {
			left: 50%;
		}
	}
	/* To disable blurring on slow mobile devices */
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(5px)) {
			.preview,
			.edit {
				background: var(--background-transparent);
				backdrop-filter: blur(5px);
			}
		}
	}
</style>
