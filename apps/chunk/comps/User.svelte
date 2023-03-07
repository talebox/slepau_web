<script>
  import { get } from "svelte/store";
	import { fade, slide } from "svelte/transition";
	import { db } from "../store";

	let user$ = db.subscribeToUser();
	let user = get(user$);
	$: {
		user = $user$;
	}
</script>

<div class="container">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img
		class="photo"
		in:fade
		alt="photo"
		src={user?.photo ? `/api/media/${user?.photo}` : ""}
	/>
	<!-- <div > -->
	<table class="content">
		<tr><td>User: </td><td in:slide>{user?.user ?? "<user>"}</td></tr>
		<tr><td>Visible:</td><td in:slide>{user?.notes_visible ?? "<x>"}</td></tr>
		<tr><td>Owned: </td><td in:slide>{user?.notes_owned ?? "<x>"}</td></tr>
		<tr
			><td>Public: </td><td in:slide>{user?.notes_owned_public ?? "<x>"}</td
			></tr
		>
	</table>
	<!-- </div> -->
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
		width: 4.4em;
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
	.photo {
		flex: 0 0 auto;
		border-radius: 999px;
		background: #1375d190;
		outline: 1px solid var(--text-main);
		/* text-align: center; */
		/* padding-block: 1em; */
		width: 80px;
		height: 80px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
