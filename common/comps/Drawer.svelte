<script>
	export let open = false;
</script>

<button
	class="toggle icon fixed"
	title="Toggle Drawer"
	on:click={() => (open = !open)}
>
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			fill-rule="evenodd"
			d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
		/>
	</svg>
</button>

{#if open}
	<div class="back" on:click={() => (open = false)} />
	<div class="container fc">
		<slot />
		<div style="flex-grow: 1;" />

		<div class="fr">
			<button style="flex-grow:1" on:click={() => (open = false)}>Close</button>
			<slot name="drawer_actions"/>
		</div>
	</div>
{/if}

<style>
	.back,
	.container {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 6;
		font-size: 1.3em;

		overscroll-behavior: contain;
	}
	.container > * {
		margin: 0;
	}
	.container {
		padding: 10px;
		width: 300px;
		/* height: 100vh;
    height: 100dvh; */
		height: 100%;
		/* padding-bottom: calc(100lvh -); */

		background: var(--background);

		justify-content: center;
		/* align-items: center; */

		gap: 16px;
	}

	.back {
		width: 100vw;
		height: 100vh;
		background: var(--background-transparent);
		/* z-index: 0; */
	}
	/* To disable blurring on slow mobile devices */
	@media (hover: hover) and (pointer: fine) {
		@supports (backdrop-filter: blur(5px)) {
			.container {
				background: var(--background-transparent);
			}
			.back {
				backdrop-filter: blur(8px);
			}
		}
	}

	.toggle {
		z-index: 5;

		bottom: 0;
		left: 0;
		border-radius: 0;
		border-top-right-radius: 20px;
	}
</style>
