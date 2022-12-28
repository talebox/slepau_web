<script>
	import { getContext, onDestroy } from "svelte";
	import { chunkValueToHtml } from "../utils/formatting";
	import { seconds_to_short } from "../utils/utils";
	export let chunk;
	export let selected = false,
		selectable = false;
	const view_type = getContext("view_type");
	$: modified =
		(view_type === "well" ? chunk?.props_dynamic?.modified : undefined) ??
		chunk?.modified;

	let mstring;
	let clear;
	function update(modified) {
		clearTimeout(clear);
		let m_d = seconds_to_short(modified);
		if (m_d) {
			const [v, delay_ms] = m_d;
			mstring = v;
			if (process.env.NODE_ENV === "development") {
				console.log("Delaying ", delay_ms);
			}
			clear = setTimeout(() => update(modified), delay_ms);
		}
	}
	$: update(modified);
	onDestroy(() => clearTimeout(clear));
</script>

<div
	class={"chunk"}
	style={`border-radius: ${chunk?.children ? "2em" : ".7em"};`}
	class:selected
	class:selectable
>
	{#if chunk?.value}
		{@html chunkValueToHtml(chunk.value)}
	{/if}

	<slot />

	<div class="top-tags">
		<slot {chunk} name="top-tags" />
		{#if chunk?.access}
			<div class="tag icon">
				{#if chunk.access === "Read"}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
						<path
							d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
						/>
					</svg>
				{:else if chunk.access === "Write"}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
						/>
					</svg>
				{:else if chunk.access === "Admin"}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
						/>
					</svg>
				{/if}
			</div>
		{/if}
	</div>
	<div class="bottom-tags">
		<slot name="bottom-tags">
			<div class="tag icon">
				{mstring}
			</div>
		</slot>
	</div>
</div>

<style>
	.chunk {
		background: var(--background-alt);
		border-radius: 2em;

		white-space: nowrap;

		transition: box-shadow 0.1s;
		outline: var(--text-muted) solid 1px;

		padding: 1em;

		overflow: hidden;
		cursor: pointer;

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.chunk:hover {
		background: var(--background);
	}
	.top-tags,
	.bottom-tags {
		pointer-events: none;
		display: flex;
		flex-direction: row;
		position: absolute;

		overflow: hidden;
		background: var(--background);
	}
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(12px)) {
			.top-tags,
			.bottom-tags {
				backdrop-filter: blur(12px);
				background: var(--background-transparent);
			}
		}
	}
	.top-tags {
		right: 0;
		top: 0;
		border-bottom-left-radius: 0.7em;
	}
	.bottom-tags {
		right: 0;
		bottom: 0;
		border-top-left-radius: 0.7em;
		opacity: 1;
		transition: opacity 200ms;
	}
	@media (hover: hover) and (pointer: fine) {
		.bottom-tags {
			opacity: 0;
		}
		.chunk:hover .bottom-tags {
			opacity: 1;
		}
	}

	.tag {
		display: flex;
		justify-content: center;
		align-items: center;
		--size: 56px;
		/* margin: 0; */
		/* border-radius: 0; */
		/* padding: 12px; */
		width: var(--size);
		height: var(--size);
	}
	.tag.icon {
		padding: 12px;
	}
</style>
