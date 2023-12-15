<script>
	import { getContext, onDestroy } from "svelte";
	import { chunkValueToHtml } from "@utils/formatting";
	import { passed_since_pretty, stringToColour } from "@utils/utils";
	import { user_data } from "../store";
	import { user_claims } from '@stores/user';
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
		let m_d = passed_since_pretty(modified);
		if (m_d) {
			const [v, delay_ms] = m_d;
			mstring = v;
			// if (process.env.NODE_ENV === "development") {
			// 	console.log("Delaying ", delay_ms);
			// }
			clear = setTimeout(() => update(modified), delay_ms);
		}
	}
	$: update(modified);
	onDestroy(() => clearTimeout(clear));
	// An array of all users
	let user_photos = [];
	$: {
		if (chunk?.props?.access?.length){
			let users = new Set(chunk.props.access.map(({user, access}) => user))
			users.add(chunk.owner); // Add chunk owner
			users.delete(user_claims.user); // Remove ourselves
			user_photos = user_data.get_photos([...users].sort()).sort((a,b) => !a.photo && !!b.photo )
		}
	}
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
	</div>
	<div class="bottom-tags">
		<slot name="bottom-tags" />
		{#if user_photos?.length}
			<div class="photos">
				{#each user_photos as { user, photo }, i}
					{#if i <= 3}
						{#if i === 3 && user_photos.length > 4}
							<div
								style="font-size:12px;width: 20px;height:20px;text-align:center"
							>
								+
							</div>
						{:else if photo}
							<img
								src={`/media/${photo}?max=21x21`}
								alt={`${user}'s photo`}
								style="border-radius:99px;width: 21px;height:21px;"
								srcset={`/media/${photo}?max=21x21,
								/media/${photo}?max=42x42 2x,
								/media/${photo}?max=84x84 3x
								`}
							/>
						{:else}
							<div
								style={`width: 21px;height:21px;border-radius:99px;background:${stringToColour(
									user,
								)}66;font-size:14px;font-weight:bold;text-align:center`}
							>
								{user.charAt(0).toUpperCase()}
							</div>
						{/if}
					{/if}
				{/each}
			</div>
		{/if}
		{#if chunk?.access}
			<div class="tag icon">
				{#if chunk.access === "Read"}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
						/>
						<path
							d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"
						/>
					</svg>
				{:else if chunk.access === "Write"}
					<svg fill="currentColor" viewBox="0 0 16 16" style="padding:2px">
						<path
							d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"
						/>
					</svg>
				{:else if chunk.access === "Admin"}
					<svg fill="currentColor" viewBox="0 0 16 16">
						<path
							d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"
						/>
						<path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
					</svg>
				{/if}
			</div>
		{/if}
		<div class="tag icon">
			{mstring}
		</div>
	</div>
</div>

<style>
	.chunk {
		background: var(--background-alt);
		border-radius: 2em;

		white-space: nowrap;

		transition: box-shadow 0.1s;
		outline: var(--border) solid 1px;

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
		flex-direction: column;
		position: absolute;
		/* overflow-x: hidden; */
		background: var(--background);
	}

	/* @media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(12px)) {
			.top-tags,
			.bottom-tags {
				backdrop-filter: blur(12px);
				background: var(--background-transparent-2);
			}
		}
	} */
	.top-tags {
		right: 0;
		top: 0;
		border-bottom-left-radius: 0.7em;
	}
	.bottom-tags {
		right: 0;
		bottom: 0;
		border-top-left-radius: 0.7em;
		opacity: .5;
		transition: opacity 200ms;
	}
	.chunk:hover .bottom-tags {
		opacity: 1;
	}
	@media (hover: hover) and (pointer: fine) {
		.bottom-tags {
			opacity: 0.2;
		}
		.chunk:hover .bottom-tags {
			opacity: 1;
		}
	}

	.photos,
	.tag {
		display: flex;
		justify-content: center;
		align-items: center;
		--size: 45px;
		width: var(--size);
		height: var(--size);
	}
	.photos {
		flex-wrap: wrap;
	}
	.photos {
		position: absolute;
		gap: 2px;
		right:2px;
		top: -45px;
	}
	.tag.icon {
		padding: 8px;
	}
</style>
