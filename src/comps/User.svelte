<script>
	import { navigate } from "@deps/routing";
	import { db } from "../store";

	const user$ = db.subscribeTo("user");
	$: user = $user$?.user || "public";
</script>

<h2 class="user fc">{user}</h2>

{#if user !== "public"}
	<button on:click={db.actions.logout}>Logout</button>
{:else}
	<button on:click={() => navigate("/login")}>Login</button>
{/if}

<style>
	button {
		margin: 0;
	}
	.user {
		margin: auto;
		border-radius: 999px;
		background: var(--background-transparent);
		outline: 1px solid var(--text-main);
		/* text-align: center; */
		/* padding-block: 1em; */
		width: 100px;
		height: 100px;
		justify-content: center;
		align-items: center;
	}
</style>
