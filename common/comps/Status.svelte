<script>
	import { status } from "../stores/status";
	import Loading from "./Loading.svelte";

	let size = "15px";
	let text;
	const onBoth = (v) => {
		text = typeof v === "string" ? v : undefined;
	};
	$: $status?.then(onBoth, onBoth);
</script>

<div class="container">
	<div class="status-container">
		{#await $status}
			<Loading {size} />
		{:then}
			<div class="status" style:width={size} style:height={size} />
		{:catch}
			<div class="status bad" style:width={size} style:height={size} />
		{/await}
	</div>

	{#if text}
		<div class="text-container" >{text}</div>
	{/if}
</div>

<style>
	.status {
		background: green;
		border-radius: 99px;
	}
	.status.bad {
		background: red;
	}
	.container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
	}
	.text-container,
	.status-container {
		padding: 10px;
		background-color: var(--button-base);
	}
	.text-container {
		min-width: 40px;
		border-radius: 20px 20px 0 0;
	}
	.status-container {
		margin: auto;
		width: fit-content;
		border-radius: 20px 20px 0 0;
	}
</style>
