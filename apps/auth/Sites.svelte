<script>
	import { navigate } from "@deps/routing";
	import Confirm from "@comps/Confirm.svelte";
	import { debounce } from "@utils/timeout";
	import { actions } from "./store";
	import { second_to_pretty, parse_seconds } from "@utils/utils";
	import { notifications } from "/common/stores/notifications";
	import CodeList from "../../common/comps/CodeList.svelte";
	import { user } from "../../common/stores/user";

	let name;
	let sites_slice;
	let selected;
	// Showing delete confirm
	let show_delete_confirm;
	// If true, we're showing editing screen
	// instead of slice with search.
	// let is_editing;

	let claims = {};
	user.then((v) => (claims = v.claims));

	function refresh() {
		return actions
			.get_sites({ any: name })
			.then((v) => v.json())
			.then((v) => {
				sites_slice = v;
			}, notifications.addError);
	}
	function on_delete_confirm(v) {
		if (v && selected?.id) {
			actions
				.del_site(selected.id)
				.then(refresh)
				.then(() => notifications.add(`Site deleted.`), notifications.addError);
		}
		show_delete_confirm = false;
		selected = undefined;
	}
	function on_save_confirm(v) {
		if (v && selected?.id) {
			actions
				.mod_site(selected.id, selected)
				.then(refresh)
				.then(() => notifications.add(`Change saved.`), notifications.addError);
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

<h1>
	Sites

	{#if claims.super}
		<button
			class="icon admin-edit"
			on:click={() => {
				navigate(`${globalThis.PREFIX}/app/admins`);
			}}
		>
			<svg
				fill="currentColor"
				viewBox="0 0 16 16"
				style="display:inline;width:unset"
			>
				<path
					d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"
				/>
				<path
					d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415z"
				/>
			</svg>
		</button>
	{/if}
</h1>
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
								navigate(`${globalThis.PREFIX}/app/sites/${site.id}/users`);
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
						<summary>
							Claims: <code>{Object.entries(site.claims).length}</code>
						</summary>
						<p>What are the global claims for this site?</p>
						<p>
							These get applied to users on every login. But users can override
							them.
						</p>
						<p>
							Claims will be parsed to JSON, so you can use it's data
							structures.
						</p>
						<p>
							We override claims <code>user</code>, <code>admin</code>, and
							<code>super</code>.
						</p>
						<p>
							Example: A flower expert and founder in the flower shop might have
							claim: <code>groups: ["expert", "founder"]</code>.
						</p>
						{#each Object.entries(site.claims) as [k, v], i}
							<div style="display:flex;gap:1em;align-items:center">
								<span
									><code style="width: 10em;display:inline-block">{k}</code
									>:</span
								>
								<input
									class="border"
									bind:value={site.claims[k]}
									placeholder="value"
								/>
								<button
									class="icon delete"
									on:click={() => {
										delete site.claims[k];
										site.claims = site.claims;
									}}
								>
									<svg fill="currentColor" viewBox="0 0 16 16">
										<path
											d="M2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225zm9.89-.69C10.966 2.214 9.578 2 8 2c-1.58 0-2.968.215-3.926.534-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466-.18-.14-.498-.307-.975-.466z"
										/>
									</svg>
								</button>
							</div>
						{/each}
						<input
							style="border: 1px dashed grey;margin-top:.5em"
							on:blur={(e) => {
								if (!e.target.value) return;
								if (typeof site.claims[e.target.value] !== "undefined") return;
								site.claims[e.target.value] = "";
								site.claims = site.claims;
								e.target.value = "";
							}}
							placeholder="key"
						/>
					</details>

					<details>
						<summary
							>Hosts:
							<CodeList list={site.hosts} />
						</summary>
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
							class="bad"
							on:click={() => {
								selected = site;
								on_save_confirm(false);
							}}>Reset</button
						>
						<button
							class="good"
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
	<Confirm action={on_delete_confirm} inverted>
		<h2 style="text-align: center;">
			Delete site "{selected.name || selected.id}"?
		</h2>
	</Confirm>
{/if}

<style>
	button.icon.admin-edit {
		float: right;
		width: 1.3em;
		height: 1.3em;
		padding: 0;
		/* display: inline-block; */
		padding: 0.15em;
	}
	button.icon.admin-edit:hover {
		background: #b3664c80;
	}

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
