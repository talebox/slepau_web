<script>
	import { navigate } from "@deps/routing";
	import Confirm from "@comps/Confirm.svelte";
	import { debounce } from "@utils/timeout";
	import { actions } from "./store";
	import { second_to_pretty, parse_seconds } from "@utils/utils";
	import { notifications } from "/common/stores/notifications";

	export let site_id;
	let filter;
	let slice;
	let selected;
	// Showing delete confirm
	let show_delete, show_new;

	function refresh() {
		return actions
			.get_users(site_id, { any: filter })
			.then((v) => v.json())
			.then((v) => {
				slice = v;
			});
	}
	function reset() {
		refresh().then(() => notifications.add("Changes reset."));
	}
	function on_new_confirm(yes) {
		let username = selected[0];
		if (yes && selected) {
			actions
				.new_user(site_id, selected)
				.then(refresh)
				.then(() => {
					notifications.add(`${username} created.`);
					show_new = false;
					selected = undefined;
				});
		} else {
			show_new = false;
			selected = undefined;
		}
	}
	function on_delete_confirm(yes) {
		let username = selected.user;
		if (yes && selected) {
			actions
				.del_user(site_id, selected.user)
				.then(refresh)
				.then(() => notifications.add(`${username} removed.`));
		}
		show_delete = false;
		selected = undefined;
	}
	function on_save(user) {
		actions
			.mod_user(site_id, user.user, user)
			.then(refresh)
			.then(() => notifications.add(`${user.user} saved.`));
	}

	$: {
		debounce(() => refresh(filter));
	}
	function new_user() {
		selected = ["", ""];
		show_new = true;
	}
</script>

<h1>Users of <code>{site_id}</code></h1>
<div class="container">
	<div style="display:flex;align-items:center;" class="fw">
		<input
			class="search"
			style="background:var(--background);border-radius:6px;padding:8px;padding-inline:12px;margin:0;flex-grow:3"
			placeholder="🔍 Search user names..."
			bind:value={filter}
		/>
		<div style="flex-grow:1;text-align:right">
			<code>{Math.min(slice?.total || 0, 10)} / {slice?.total || 0}</code>
		</div>
	</div>

	<div class="slices">
		{#if slice}
			{#each slice.items as user (user.user)}
				<details class="slice">
					<summary>
						<code>{user.user}</code>
						<div style="flex-grow:1" />

						<code>{Object.entries(user.claims).length} claims</code>
						<svg fill={user.active ? "#0f08" : "#f008"} viewBox="0 0 100 100">
							<circle cx="50%" cy="50%" r="50" />
						</svg>
						<button
							class="icon delete"
							on:click={() => {
								selected = user;
								show_delete = true;
							}}
						>
							<svg fill="currentColor" viewBox="0 0 16 16">
								<path
									d="M2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225zm9.89-.69C10.966 2.214 9.578 2 8 2c-1.58 0-2.968.215-3.926.534-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466-.18-.14-.498-.307-.975-.466z"
								/>
							</svg>
						</button>
					</summary>
					<details>
						<summary>Active: 
							{#if user.active}
							<b style="color:#0f0">true</b>
							{:else}
							<b style="color:#f00">false</b>
							{/if}
						</summary>
						
						<p>This user <b>{user.active ? "can" : "can't"}</b> perform new logins.</p>
						
						<p>Note that an active token <b>can't be revoked</b>. <br/>
							Consider lowering <code>max_age</code> on site settings if you're worried about this.
						</p>
						<button style:color={user.active ? "#f00" : "#0f0"}>{user.active ? "Disable" : "Enable"}</button>
					</details>

					<details>
						<summary
							>Claims: <code>{Object.entries(user.claims).length}</code
							></summary
						>
						<p>What claims will the user have?</p>
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
						{#each Object.entries(user.claims) as [k, v], i}
							<div style="display:flex;gap:1em;align-items:center">
								<span
									><code style="width: 10em;display:inline-block">{k}</code
									>:</span
								>
								<input
									class="border"
									bind:value={user.claims[k]}
									placeholder="value"
								/>
								<button
									class="icon delete"
									on:click={() => {
										delete user.claims[k];
										user.claims = user.claims;
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
								if (typeof user.claims[e.target.value] !== "undefined") return;
								user.claims[e.target.value] = "";
								user.claims = user.claims;
								e.target.value = "";
							}}
							placeholder="key"
						/>
					</details>

					<div style="margin:auto;width:max-content">
						<button class="cancel" on:click={reset}>Cancel</button>
						<button class="save" on:click={() => on_save(user)}>Save</button>
					</div>
				</details>
			{/each}
		{/if}
		{#if slice?.items.length === 0}
			<div>No users</div>
		{/if}
	</div>
	<button
		class="new icon"
		style:outline={slice?.items.length === 0
			? "2px dashed #888F"
			: "2px dashed #888A"}
		on:click={new_user}
		><svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg></button
	>
</div>

{#if show_delete}
	<Confirm action={on_delete_confirm}>
		<h2 style="text-align: center;">
			Delete user "{selected.user}"?
		</h2>
	</Confirm>
{/if}
{#if show_new}
	<Confirm action={on_new_confirm}>
		<h2 style="text-align: center;">
			New user "{selected[0]}"?
		</h2>
		<label>
			Username:
			<input bind:value={selected[0]} />
		</label>
		<label>
			Password:
			<input type="password" bind:value={selected[1]} />
		</label>
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
