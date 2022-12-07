<script>
	import { fade, slide } from "svelte/transition";
	import { user } from "../store";
</script>

<div class="container">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img
		class="photo"
		in:fade
		alt="photo"
		src={$user?.photo ? `/api/media/${$user?.photo}` : ""}
	/>
	<!-- <div > -->
	<table class="content">
		<tr><td>user:</td><td in:slide>{$user?.user ?? "<user>"}</td></tr>
		<tr
			><td>notes:</td><td in:slide>{$user?.note_count ?? "<note_count>"}</td
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
		width: 4em;
		text-align: right;
	}
	.content {
		font-size: 0.8em;
		margin: 0;
		flex: 0 1 180px;
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
