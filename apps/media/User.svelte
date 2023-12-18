<script>
	import { get } from "svelte/store";
	import { slide } from "svelte/transition";
	import { db } from "./store";
	import { user_claims } from "/common/stores/user";
	import UserImg from "@comps/UserImg.svelte";

	let user_info$ = db.subscribeToUser();
	let user_info = get(user_info$);
	$: {
		user_info = $user_info$;
	}
</script>

<div class="container">
	<UserImg />

	<table class="content">
		<tr><td>User: </td><td in:slide>{user_claims.user ?? "<user>"}</td></tr>
		<tr
			><td>Size: </td><td in:slide
				>{user_info.size ? (user_info.size / 2 ** 20).toFixed(0) : "<size>"} / {user_claims.media_limit
					? (user_claims.media_limit / 2 ** 20).toFixed(0) + "MB"
					: "♾️"}</td
			></tr
		>
	</table>
</div>

<style>
	.container {
		display: flex;
		padding: 8px;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.container td:first-child {
		width: min-content;
		text-align: right;
	}
	.content {
		font-size: 0.8em;
		margin: 0;
		flex: 0 1 160px;
	}
	.content td {
		padding: 4px;
	}
	.content tr:not(:last-child) td {
		padding-bottom: 0;
	}
</style>
