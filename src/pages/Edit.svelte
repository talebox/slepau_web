<script>
	import { slide } from "svelte/transition";
	import { debounce } from "../utils/timout";
	import {
		db,
		editing_id,
		wants_preview,
		is_phone,
		notifications,
		setStatus,
	} from "../store";
	import { mdToHtml, valueTransform } from "../utils/formatting";
	import {
		applyDiff,
		REGEX_CHUNK,
		str_insert,
		str_remove,
	} from "../utils/utils";
	import { fetchE } from "../utils/network";

	export let id = undefined;
	let editor,fileInput;

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
		if (chunk?.value && (id || showing_preview)) {
			let value = chunk.value;
			value = valueTransform(value);

			value = value.replace(REGEX_CHUNK, (m, id) =>
				id ? `(/page/${id})` : `(/preview/${id})`
			);
			preview = mdToHtml(value);
		}
	}

	function close() {
		if (id) {
			window.history.back();
		} else if ($editing_id) {
			$editing_id = undefined;
		}
	}
	function share() {
		navigator.clipboard.writeText(
			`${location.protocol}//${location.host}/note/${_id}`
		);
		notifications.add("Link copied.");
	}
	function copy_id() {
		navigator.clipboard.writeText(chunk.id);
		notifications.add("Id copied.");
	}
	function update_value(value) {
		debounce(() => db.actions.chunks.put(chunk.id, value), 500, chunk.id);
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
	function editor_type(value) {
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
	function add_media() {
		if (!this.files.length) {
			console.log("no files selected");
			return;
		}
		const files = Array.from(this.files);

		setStatus(
			Promise.all(
				files.map((f) =>
					fetchE("/api/media", { method: "POST", body: f }).then((v) =>
						v.json()
					)
				)
			),
			{
				on_resolve: "Upload success!",
			}
		).then((items) => {
			let [v, selection] = get_editor();
			// If only 1 file selected, and there is a textarea selection, then replace with path, instead of markdown images :)
			if (items.length === 1 && selection[1] > selection[0]) {
				editor_type(`/api/media/${items[0].id}`);
			} else {
				editor_type(
					items
						.map((item) =>
							item.type === "Image"
								? `![](media/${item.id})`
								: item.type === "Video"
								? `<video controls> <source src="/api/media/${items[0].id}"/> </video>`
								: item.id
						)
						.join("\n")
				);
			}
		});
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
			["*", "[", "{", "(", "_"].includes(e.key) &&
			selection[1] > selection[0]
		) {
			// Means there's a selection

			v = str_insert(v, selection[0], e.key);

			// console.log(v);

			// Add 1 to selections
			selection = selection.map((v) => v + 1);

			v = str_insert(
				v,
				selection[1],
				e.key === "[" ? "]" : e.key === "(" ? ")" : e.key === "{" ? "}" : e.key
			);
			// console.log(v);

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
			console.log(line);
			let f = line.match(/^[ \t]*\- /);
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
		let clip = e.clipboardData || window.clipboardData;
		
	}
</script>

{#if id}
	{#if chunk}
		<div style="max-width:800px;margin:auto">
			{@html preview}
		</div>
	{:else}
		<h1>Chunk not available</h1>
		Check that the owner has at least allowed read access by public `share: public
		read`
	{/if}
{:else if chunk}
	<div class="container" style:display={!_id ? "none" : "initial"}>
		{#if chunk}
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
						// console.log(e)
						update_value(e.target.value);
					}}
				/>
				<div class="actions">
					<input
						bind:this={fileInput}
						on:change={add_media}
						type="file"
						style="display:none;"
						multiple
					/>
					<button class="action icon" on:click={() => fileInput?.click()}>
						<svg fill="currentColor" viewBox="0 0 16 16">
							<path
								d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
							/>
							<path
								d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"
							/>
						</svg>
					</button>
					<button class="action icon" on:click={copy_id}>
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
					{@html preview}
				</div>
				<div class="actions">
					<button class="action share icon" on:click={share}>
						<svg fill="currentColor" viewBox="0 0 16 16">
							<path
								d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
							/>
						</svg>
					</button>
				</div>
			</div>
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
		position: fixed;
		/* position: absolute; */
		top: -2px;
		left: -2px;
		height: calc(100% + 4px);
		/* height: calc(100dvh + 4px); */
		/* height: -webkit-fill-available; */
		/* height: calc(100% + 4px); */
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

	.actions {
		display: flex;
		flex-direction: column;
		position: absolute;
		right: 0;
		bottom: calc(var(--button-icon-size) + 30px);
	}
	.action {
		margin: 0;
		border-radius: 0;
		width: var(--button-icon-size);
		height: var(--button-icon-size);
	}
	.action:first-of-type {
		border-top-left-radius: 24px;
	}
	.action:last-of-type {
		border-bottom-left-radius: 24px;
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
	/* To disable blurring on slow mobile devices */
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(5px)) {
			.preview-c,
			.edit {
				background: var(--background-transparent);
				backdrop-filter: blur(5px);
			}
		}
	}
</style>
