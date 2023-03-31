<script>
	import { fly, slide } from "svelte/transition";
	import { debounce } from "@utils/timeout";
	import {
		db,
		local_settings$,
		editing_id$,
		is_phone$,
		actions,
	} from "../store";
	import notifications from "/common/stores/notifications";
	import { mdToHtml, valueTransform } from "@utils/formatting";
	import { applyDiff, REGEX_CHUNK, str_insert, str_remove } from "@utils/utils";
	import ChunkDetails from "../comps/ChunkDetails.svelte";

	export let id = undefined;
	let editor, fileInput;

	$: _id = id || $editing_id$;

	// Clear editor when opening new view
	$: if (_id && editor) editor.value = "";

	$: value$ = _id ? db.subscribeTo(`chunks/${_id}/value`) : undefined;
	let value$;
	$: value = value$ ? $value$ : undefined;

	// $: value =  value$ ? $value$ : undefined;
	$: diff$ = _id
		? db.subscribeTo(`chunks/${_id}/value/diff`, { request_on: false })
		: undefined;
	$: diff = diff$ ? $diff$ : undefined;
	// $: console.log(value);

	// Set editor value when chunk arrives
	$: if (value && editor) {
		// Fill editor if it's empty, or if chunk has a negative no_edit field
		// (used to indicate that it's an update to other UI components and not this one)
		if (!editor.value) {
			editor.value = value;
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
	$: showing_preview = $local_settings$.wants_preview || !$is_phone$;

	// Triggers on chunk.value and showing_preview
	let preview;
	$: {
		if (value && (id || showing_preview)) {
			let v = valueTransform(value);

			v = v.replace(REGEX_CHUNK, (m, id) => `(/edit/${id})`);
			preview = mdToHtml(v);
		}
	}

	function close() {
		if (id) {
			window.history.back();
		} else if ($editing_id$) {
			$editing_id$ = undefined;
			db.maybe_request_views();
		}
	}
	function share_live() {
		navigator.clipboard.writeText(
			`${location.protocol}//${location.host}/preview/${_id}`
		);
		notifications.add("Link copied.");
	}
	function share_static() {
		navigator.clipboard.writeText(
			`${location.protocol}//${location.host}/page/${_id}`
		);
		notifications.add("Link copied.");
	}
	function copy_id() {
		navigator.clipboard.writeText(_id);
		notifications.add("Id copied.");
	}
	function update_value(value) {
		debounce(() => actions.chunks.put(_id, value), 500, _id);
	}
	function get_editor(e) {
		let _editor = e ? e.target : editor;
		let selection = [_editor.selectionStart, _editor.selectionEnd];
		let v = _editor.value;
		return [v, selection];
	}
	function set_editor(e, [v, selection]) {
		let _editor = e ? e.target : editor;

		_editor.value = v;
		_editor.selectionStart = selection[0];
		_editor.selectionEnd = selection[1];
	}
	function editor_typeout(value) {
		if (typeof value !== "string") return;
		let [v, selection] = get_editor();

		// Remove what's selected
		if (selection[1] > selection[0]) {
			v = str_remove(v, selection[0], selection[1]);
			selection[1] = selection[0];
		}
		// Insert what we want, and increase selection
		{
			v = str_insert(v, selection[0], value);
			selection[1] += value.length;
		}

		set_editor(undefined, [v, selection]);
		update_value(v);
	}
	function add_media_(files) {
		if (!files?.length) {
			notifications.add("No files selected");
			return;
		}
		(files.length == 1
			? actions.media.post(files[0]).then((x) => [x])
			: actions.media.post_many(files)
		).then((items) => {
			let [v, selection] = get_editor();
			// If only 1 file selected, and there is a textarea selection, then replace with path, instead of markdown images :)
			if (items.length === 1 && selection[1] > selection[0]) {
				editor_typeout(`/media/${items[0].id}`);
			} else {
				editor_typeout(
					items
						.map((item) =>
							item.meta.type.startsWith("image")
								? `(image/${item.id})`
								: item.meta.type.startsWith("video")
								? `(video/${item.id})`
								: item.id
						)
						.join("\n")
				);
			}
		});
	}
	function add_media() {
		if (!this.files.length) {
			console.log("no files selected");
			return;
		}
		const files = Array.from(this.files);
		add_media_(files);
	}
	function keydown(e) {
		if (!["Tab"].includes(e.key)) return; // Trigger on these

		let [v, selection] = get_editor(e);

		if (e.key === "Tab") {
			if (selection[1] > selection[0]) {
				notifications.add("Action not implemented yet.");
			} else {
				v = str_insert(v, selection[0], "\t");
				selection = selection.map((v) => v + 1);
			}

			set_editor(e, [v, selection]);
			e.preventDefault();
			update_value(v);
		}
	}
	function keypress(e) {
		let [v, selection] = get_editor(e);

		if (
			["*", "[", "{", "(", "_", '"', "`", "'", "<"].includes(e.key) &&
			selection[1] > selection[0]
		) {
			// Means there's a selection
			v = str_insert(v, selection[0], e.key);

			// Add 1 to selections
			selection = selection.map((v) => v + 1);

			v = str_insert(
				v,
				selection[1],
				e.key === "["
					? "]"
					: e.key === "("
					? ")"
					: e.key === "{"
					? "}"
					: e.key === "<"
					? ">"
					: e.key
			);

			set_editor(e, [v, selection]);
			e.preventDefault();
			update_value(v);
		} else if (selection[1] > selection[0]) {
			// let before = v.substring(0, selection[0]),
			// 	after = v.substring(selection[1]);
			// v = `${before}${e.key}${after}`;
			// selection[1] = selection[0];
			// // Add 1 to selections
			// selection = selection.map((v) => v + 1);
			// set_editor(e, [v, selection]);
			// e.preventDefault();
			// update_value(v);
		} else if (e.key === "Enter") {
			let lineStart = selection[0] - 1;
			while (lineStart > 0) {
				if (v[lineStart] === "\n") {
					++lineStart;
					break;
				}
				--lineStart;
			}
			let line = v.substring(lineStart, selection[0]);

			let f;
			for (let regex of [
				/^[ \t]*\- (?:\[[ \-x]\])?[ \t]*/,
				/^[ \t]*\d+\. (?:\[[ \-x]\])?[ \t]*/,
			]) {
				f = line.match(regex);
				if (f) break;
			}
			if (f) {
				const toadd = "\n" + f[0];
				v = str_insert(v, selection[0], toadd);
				selection = selection.map((v) => v + toadd.length);

				set_editor(e, [v, selection]);
				e.preventDefault();
				update_value(v);
			}
		} else {
			if (process.env.NODE_ENV === "development") {
				console.log(e);
			}
		}
	}
	function paste(e) {
		let clip = e.clipboardData || window.clipboardData; // DataTransfer
		if (clip?.files?.length) {
			e.preventDefault();
			add_media_([...clip.files]);
		}
	}
	function dragover(ev) {
		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();
	}
	function drop(ev) {
		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();

		let files = [];

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			files = [...ev.dataTransfer.items]
				.filter((v) => v.kind === "file")
				.map((v) => v.getAsFile());
		} else {
			// Use DataTransfer interface to access the file(s)
			files = [...ev.dataTransfer.files];
		}
		add_media_(files);
	}
	let showing_details = false;
</script>

{#if value}
	<div
		class="container"
		style:display={!_id ? "none" : "initial"}
		on:dragover={dragover}
		on:drop={drop}
	>
		<div class="edit">
			<textarea
				class="textarea"
				spellcheck="false"
				autocapitalize="off"
				autocorrect="off"
				on:keydown={keydown}
				on:keypress={keypress}
				on:paste={paste}
				bind:this={editor}
				on:input={(e) => {
					update_value(e.target.value);
				}}
			/>
			{#if $local_settings$?.showing_details}
				<div class="details">
					<ChunkDetails id={_id} />
				</div>
			{/if}
			<div class="side-actions">
				<button
					class="action icon"
					title="Toggle Details"
					on:click={() =>
						($local_settings$.showing_details =
							!$local_settings$.showing_details)}
				>
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M6.646 5.646a.5.5 0 1 1 .708.708L5.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zm2.708 0a.5.5 0 1 0-.708.708L10.293 8 8.646 9.646a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2z"
						/>
						<path
							d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
						/>
					</svg>
				</button>

				<input
					bind:this={fileInput}
					on:change={add_media}
					type="file"
					style="display:none;"
					multiple
				/>
				<button
					class="action icon"
					title="Upload"
					on:click={() => fileInput?.click()}
				>
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
						/>
						<path
							d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"
						/>
					</svg>
				</button>
				<button class="action icon" title="Copy Id" on:click={copy_id}>
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
						/>
						<path
							d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
						/>
					</svg>
				</button>
			</div>
		</div>

		<div class="preview-c" class:showing_preview>
			<div class="preview">
				<div class="page">
					{@html preview}
				</div>
			</div>
			<div class="side-actions">
				<button
					class="action share icon"
					title="Copy Live Page Link"
					on:click={share_live}
				>
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
						/>
						<path
							d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
						/>
					</svg>
				</button>
				<button
					class="action share icon"
					title="Copy Static Page Link"
					on:click={share_static}
				>
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							fill-rule="evenodd"
							d="M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5Zm-9.736 7.35v3.999h-.791v-1.714H1.79v1.714H1V11.85h.791v1.626h1.682V11.85h.79Zm2.251.662v3.337h-.794v-3.337H4.588v-.662h3.064v.662H6.515Zm2.176 3.337v-2.66h.038l.952 2.159h.516l.946-2.16h.038v2.661h.715V11.85h-.8l-1.14 2.596H9.93L8.79 11.85h-.805v3.999h.706Zm4.71-.674h1.696v.674H12.61V11.85h.79v3.325Z"
						/>
					</svg>
				</button>
			</div>
		</div>

		{#if !id}
			<button class="close icon" title="Close" on:click={close}>
				<svg fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
					/>
				</svg>
			</button>
		{/if}

		{#if $is_phone$}
			<button
				class="preview-btn icon"
				on:click={() =>
					($local_settings$.wants_preview = !$local_settings$.wants_preview)}
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
		position: fixed;
		top: -2px;
		left: -2px;
		height: calc(100% + 4px);
		width: 100%;
		z-index: 2;
		overflow-y: visible;
	}

	.edit,
	.preview-c {
		background: var(--background-body);
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}

	.preview-c {
		display: none;
		border-left: 1px solid black;
	}
	.preview-c.showing_preview {
		display: initial;
	}
	.preview {
		padding-inline: 1em;
	}
	.textarea,
	.preview {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: none;
		resize: none;
		border-radius: 0;

		overflow-y: auto;
		overscroll-behavior: contain;
		padding-bottom: 30em;
	}
	.textarea:focus {
		box-shadow: none;
	}

	.close,
	.preview-btn {
		position: absolute;
		margin: 0;
		width: var(--button-icon-size);
		height: var(--button-icon-size);
	}
	.close {
		top: 0;
		right: 0;
		border-radius: 0 0 0 24px;
	}
	.preview-btn {
		right: 0;
		bottom: 0;
		border-radius: 24px 0 0 0;
	}

	@media (min-width: 768px) {
		.preview-c,
		.edit {
			width: 50%;
		}
		.preview-c {
			left: 50%;
		}
	}

	.details {
		/* pointer-events: none; */
		position: absolute;
		top: 92px;
		right: 0;
		white-space: pre-wrap;
		width: 12em;
		border-radius: 12px 0 0 12px;
		background: var(--background);
		border: 1px solid var(--background-transparent);
		border-right: none;
	}

	/* To disable blurring on slow mobile devices */
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(5px)) {
			.preview-c,
			.edit,
			.details {
				background: var(--background-transparent);
				backdrop-filter: blur(8px);
			}
			.details {
				background: var(--background-transparent-2);
			}
		}
	}
</style>
