<script>
	export let list = [];
	export let max = 2;
</script>

{#if list.length > max}
	<code >{list.length} total</code>
{:else}
	{#each list as v, i}
		<code>{v}</code>{i + 1 < list.length ? ", " : ""}
	{/each}
{/if}
