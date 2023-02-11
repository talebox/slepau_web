<script>
	import { navigate } from "@deps/routing";
	import Confirm from "@comps/Confirm.svelte";
	import { debounce } from "@utils/timeout";
	import { actions } from "./store";
	import { second_to_pretty, parse_seconds } from "@utils/utils";
	import { notifications } from "/common/stores/notifications";

	let name;
	let sites_slice;
	let selected;
	// Showing delete confirm
	let show_delete_confirm;
	// If true, we're showing editing screen
	// instead of slice with search.
	// let is_editing;

	function refresh() {
		return actions
			.get_sites({ any: name })
			.then((v) => v.json())
			.then((v) => {
				sites_slice = v;
			});
	}
	function on_delete_confirm(v) {
		if (v && selected?.id) {
			actions
				.del_site(selected.id)
				.then(refresh)
				.then(() => notifications.add(`Site deleted.`));
		}
		show_delete_confirm = false;
		selected = undefined;
	}
	function on_save_confirm(v) {
		if (v && selected?.id) {
			actions
				.mod_site(selected.id, selected)
				.then(refresh)
				.then(() => notifications.add(`Change saved.`));
		} else {
			refresh().then(() => notifications.add("Changes reset."));
		}

		selected = undefined;
	}

	$: {
		debounce(() => refresh(name));
	}
	function new_site() {
		actions.new_site().then(() => refresh());
	}
</script>

<h1>Sites</h1>
<div class="container">
	<div style="display:flex;align-items:center;" class="fw">
		<input
			class="search"
			style="background:var(--background);border-radius:6px;padding:8px;padding-inline:12px;margin:0;flex-grow:3"
			placeholder="🔍 Search site names, ids..."
			bind:value={name}
		/>
		<div style="flex-grow:1;text-align:right">
			<code
				>{Math.min(sites_slice?.total || 0, 10)} / {sites_slice?.total ||
					0}</code
			>
		</div>
	</div>

	<div class="slices">
		{#if sites_slice}
			{#each sites_slice.items as site (site.id)}
				<details class="slice">
					<summary>
						{#if site.name}
							<span style="margin: 0 1em 0 .5em;font-size:1.2em"
								><b>{site.name}</b></span
							>
						{/if}
						<code>{site.id}</code>
						<div style="flex-grow:1" />

						<button
							class="icon edit"
							on:click={() => {
								navigate(`/app/sites/${site.id}/users`);
							}}
						>
							{site.users}
							<svg
								fill="currentColor"
								viewBox="0 0 16 16"
								style="display:inline;width:unset"
							>
								<path
									d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
								/>
							</svg>
						</button>

						<button
							class="icon delete"
							on:click={() => {
								selected = site;
								show_delete_confirm = true;
							}}
						>
							<svg fill="currentColor" viewBox="0 0 16 16">
								<path
									d="M2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225zm9.89-.69C10.966 2.214 9.578 2 8 2c-1.58 0-2.968.215-3.926.534-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466-.18-.14-.498-.307-.975-.466z"
								/>
							</svg>
						</button>
					</summary>

					<!-- Deatils -->
					<!-- <label>
						Name: <input bind:value={site.name} placeholder="..." />
					</label> -->

					<details>
						<summary>Name: <code><b>{site.name}</b></code></summary>
						<p>A human name for this site.</p>
						<input
							class="border"
							bind:value={site.name}
							placeholder="Flower Shop..."
						/>
					</details>

					<details>
						<summary
							>Key max age: <code
								>{typeof site.max_age === "string"
									? "click outside to parse"
									: second_to_pretty(site.max_age)}</code
							></summary
						>
						<p>
							This is how long the browser will rememeber the key for (in
							seconds).
						</p>
						<p>
							<b>1 to 2 digits</b>, followed by <b>a multiplier m/h/d/w/M/y</b>
							<br />
							to represent min/hours/days/weeks/Months/years accordingly.
						</p>
						<p>
							Example: <code>12d</code> would be parsed to <code>1036800</code> seconds.
						</p>
						<p>
							For details, this regex is used <code>{"\\d{1,2}[mhdwMy]"}</code>
						</p>
						<input
							class="border"
							bind:value={site.max_age}
							on:blur={() =>
								(site.max_age = parse_seconds(site.max_age, 86400))}
						/>
					</details>
					<details>
						<summary>Hosts: <code>{site.hosts?.join(", ")}</code></summary>
						<p>What hosts does this site answer to?</p>
						<p>
							Example: Flower shop might answer to <code>flowers.com</code>.
						</p>
						{#each site.hosts as host, i}
							<input
								class="border"
								bind:value={site.hosts[i]}
								on:blur={() => (site.hosts = site.hosts.filter((v) => !!v))}
							/>
						{/each}
						<input
							style="border: 1px dashed grey"
							on:blur={(e) => {
								if (!e.target.value) return;
								site.hosts = [...site.hosts, e.target.value];
								e.target.value = "";
							}}
							placeholder="flowers.com"
						/>
					</details>

					<div style="margin:auto;width:max-content">
						<button
							class="cancel"
							on:click={() => {
								selected = site;
								on_save_confirm(false);
							}}>Cancel</button
						>
						<button
							class="save"
							on:click={() => {
								selected = site;
								on_save_confirm(true);
							}}>Save</button
						>
					</div>
				</details>
			{/each}
		{/if}
		{#if sites_slice?.items.length === 0}
			<div>No sites</div>
		{/if}
	</div>
	<button
		class="new icon"
		style:outline={sites_slice?.items.length === 0
			? "2px dashed #888F"
			: "2px dashed #888A"}
		on:click={new_site}
		><svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg></button
	>
</div>

{#if show_delete_confirm}
	<Confirm action={on_delete_confirm}>
		<h2 style="text-align: center;">
			Delete site "{selected.name || selected.id}"?
		</h2>
	</Confirm>
{/if}

<style>
	
	button.icon {
		width: 2.4em;
		height: 2.4em;
		padding: 0.5em 0.5em;
		background: transparent;
		border-radius: 12px;
		margin: 0;
		/* outline: 2px dashed #8888; */
	}
	button.icon.new {
		width: 2.8em;
		height: 2.8em;
	}
	button.icon.edit {
		width: unset;
		display: flex;
		align-items: center;
		gap: 1em;
		/* height: unset; */
	}
	button.icon.new:hover {
		background: #00ff5178;
	}
	button.icon.edit:hover {
		background: #08f8;
	}
	button.icon.delete:hover {
		background: #f008;
	}
	.container {
		display: flex;
		flex-flow: column;
		gap: 1em;
		align-items: center;
	}
</style>