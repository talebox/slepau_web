<script>
	import { slide } from "svelte/transition";
	export let selected;
	export let on_remove;
	export let on_add;

	const selected_toggle = () => (selected = selected ? undefined : []);
</script>

{#if !selected}
	<button class="chunk-new icon fixed" title="Add" in:slide on:click={on_add}>
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
			/>
		</svg>
	</button>
{:else}
	<button class="chunk-del icon fixed" title="Remove" in:slide on:click={on_remove}>
		<svg fill="currentColor" viewBox="0 0 16 16">
			<path
				d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
			/>
			<path
				fill-rule="evenodd"
				d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
			/>
		</svg>
	</button>
{/if}

<button class="chunk-select icon fixed" title="Select" in:slide on:click={selected_toggle}>
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"
		/>
		<path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
	</svg>
</button>

<style>
	.chunk-new,
	.chunk-select,
	.chunk-del {
		opacity: 1;
		transition: opacity 1s;
		bottom: 0;
	}
	.chunk-new {
		right: 0;
		border-radius: 0;
	}
	.chunk-select {
		right: var(--button-icon-size);
		border-radius: 20px 0 0 0;
	}
	.chunk-del {
		right: 0;
		color: #b93737;
		border-radius: 0;
	}
</style>
