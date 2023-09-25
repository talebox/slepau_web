<script>
	import Confirm from "@comps/Confirm.svelte";
	import { debounce } from "@utils/timeout";
	import CodeList from "../../common/comps/CodeList.svelte";
	import { actions } from "./store";
	import { notifications } from "/common/stores/notifications";

	let filter;
	let slice;
	let selected;
	// Showing delete confirm
	let show_delete, show_new;

	function refresh() {
		return actions
			.get_admins({ any: filter })
			.then((v) => v.json())
			.then((v) => {
				slice = v;
			}, notifications.addError);
	}
	function reset() {
		refresh().then(() => notifications.add("Changes reset."));
	}
	function on_new_confirm(yes) {
		let username = selected[0];
		if (yes && selected) {
			actions
				.new_admin(selected)
				.then(() => {
					notifications.add(`${username} created.`);
					show_new = false;
					selected = undefined;
				})
				.then(refresh)
				.catch(notifications.addError);
		} else {
			show_new = false;
			selected = undefined;
		}
	}
	function on_delete_confirm(yes) {
		let username = selected.user;
		if (yes && selected) {
			actions
				.del_admin(selected.user)
				.then(
					() => notifications.add(`${username} removed.`)
					
				)
				.then(refresh)
				.catch(notifications.addError);
		}
		show_delete = false;
		selected = undefined;
	}
	function on_save(user) {
		actions
			.mod_admin(user.user, user)
			.then(
				() => notifications.add(`${user.user} saved.`)
			)
			.then(refresh)
			.catch(notifications.addError);
	}

	refresh(filter)
	$: {
		debounce(() => refresh(filter), 1000);
	}
	function on_want_new() {
		selected = ["", ""];
		show_new = true;
	}
</script>

<h1>Admins</h1>
<div class="container">
	<div style="display:flex;align-items:center;" class="fw">
		<input
			class="search"
			style="background:var(--background);border-radius:6px;padding:8px;padding-inline:12px;margin:0;flex-grow:3"
			placeholder="🔍 Search admin names..."
			bind:value={filter}
		/>
		<div style="flex-grow:1;text-align:right">
			<code>{Math.min(slice?.total || 0, 10)} / {slice?.total || 0}</code>
		</div>
	</div>

	<div class="slices">
		{#if slice}
			{#each slice.items as admin (admin.user)}
				<details class="slice">
					<summary>
						<code>{admin.user}</code>
						<div style="flex-grow:1" />

						<code>{admin.sites.length} sites</code>
						<svg fill={admin.active ? "#0f08" : "#f008"} viewBox="0 0 100 100">
							<circle cx="50%" cy="50%" r="50" />
						</svg>
						<button
							class="icon delete"
							on:click={() => {
								selected = admin;
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
						<summary
							>Active:
							{#if admin.active}
								<b style="color:#0f0">true</b>
							{:else}
								<b style="color:#f00">false</b>
							{/if}
						</summary>

						<p>
							This admin <b>{admin.active ? "can" : "can't"}</b> perform new logins.
						</p>

						<p>
							Note that an <b>active token can't be revoked</b>.
						</p>
						<p>
							For increased security, admins have a <code>1hr</code> token
							<b>max age</b>.
						</p>
						<button
							style:color={admin.active ? "#f00" : "#0f0"}
							on:click={() => (admin.active = !admin.active)}
							>{admin.active ? "Disable" : "Enable"}</button
						>
					</details>

					<details>
						<summary
							>Claims: <code>{Object.entries(admin.claims).length}</code
							></summary
						>
						<p>What claims will the admin have?</p>
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
						{#each Object.entries(admin.claims) as [k, v], i}
							<div style="display:flex;gap:1em;align-items:center">
								<span
									><code style="width: 10em;display:inline-block">{k}</code
									>:</span
								>
								<input
									class="border"
									bind:value={admin.claims[k]}
									placeholder="value"
								/>
								<button
									class="icon delete"
									on:click={() => {
										delete admin.claims[k];
										admin.claims = admin.claims;
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
								if (typeof admin.claims[e.target.value] !== "undefined") return;
								admin.claims[e.target.value] = "";
								admin.claims = admin.claims;
								e.target.value = "";
							}}
							placeholder="key"
						/>
					</details>

					<details>
						<summary
							>Super:
							{#if admin.super}
								<b style="color:#0f0">true</b>
							{:else}
								<b style="color:#f00">false</b>
							{/if}
						</summary>
						<p>
							This <b>{admin.super ? "is" : "isn't"}</b> a super admin.
						</p>
						<p>
							Note that supers have <b>complete control over all data</b> managed
							by this instance, including removing other's super admin status.
						</p>
						<p>
							Also note that supers <b>cannot remove their own super status</b>.
							Ensuring that there's always at least 1 super admin per instance.
						</p>
						<button
							style:color={admin.super ? "#f00" : "#0f0"}
							on:click={() => (admin.super = !admin.super)}
							>{admin.super ? "Remove Super" : "Make Super"}</button
						>
					</details>
					<details>
						<summary
							>Sites:
							<CodeList list={admin.sites} />
						</summary>
						<p>What sites does this admin have access to?</p>
						<p>
							Example: Admin <code>john</code> might manage site
							<code>balab_losab</code>.
						</p>
						{#each admin.sites as site, i}
							<input
								class="border"
								bind:value={admin.sites[i]}
								on:blur={() => (admin.sites = admin.sites.filter((v) => !!v))}
							/>
						{/each}
						<input
							style="border: 1px dashed grey"
							on:blur={(e) => {
								if (!e.target.value) return;
								admin.sites = [...admin.sites, e.target.value];
								e.target.value = "";
							}}
							placeholder="balab_losab"
						/>
					</details>

					<div style="margin:auto;width:max-content">
						<button class="bad" on:click={reset}>Reset</button>
						<button class="good" on:click={() => on_save(admin)}>Save</button>
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
		on:click={on_want_new}
		><svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg></button
	>
</div>

{#if show_delete}
	<Confirm action={on_delete_confirm} inverted>
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
