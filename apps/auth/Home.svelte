<script>
	// var logged_in;
	// console.log("HOST")
	function auth_click() {
		if (global.logged_in) {
			fetch("/logout").then(
				() => location.reload(),
				() => {}
			);
		} else {
			location.href = "/login";
		}
	}
	let svg, font;
	function resize() {
		if (svg) {
			let min = Math.min(svg.scrollHeight, svg.scrollWidth);
			font = `${(min / 1000) * 100}px`;
		}
	}
	setTimeout(resize, 50);
</script>

<svelte:window on:resize={resize} />

{#if global.logged_in}
	<div
		style="position: absolute; top:-30vh;left:0;width:100vw;height:100vh;opacity:0.2;overflow:hidden;pointer-events:none"
	>
		<svg
			bind:this={svg}
			id="auth_svg"
			fill="#8888"
			viewBox="0 0 16 16"
			style="position:absolute;top:0;left:0;width:100%;height:100%"
		>
			<style>
				text {
					font-size: 2px;
					fill: var(--text-main);
				}
			</style>
			<path
				d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
			/>
			<text x="6.9" y="8.1" textLength="7.1px" lengthAdjust="spacingAndGlyphs">
				{global.user}
			</text>
		</svg>
		<!-- <h1 style="position:absolute;top:calc(50%);left:calc(44%);transform:translate(-0%,0%)" style:font-size={font}>
		</h1> -->
	</div>
{/if}

<h1>
	Auth
	<button
		id="auth_button"
		style="padding: 0.2em;margin-inline: .3em;"
		on:click={auth_click}
		title={global.logged_in ? "Break Key" : "Create Key"}
	>
		{#if global.logged_in}
			<svg
				id="auth_svg_broken"
				fill="currentColor"
				viewBox="0 0 16 16"
				style="position:relative;top:4px"
			>
				<path
					d="M 14.633702,8.7984413 14.946791,10.89653 12.848702,11.209619 12.639977,9.8108929 11.241251,10.019619 11.037463,8.4949426 12.138341,6.98981"
					id="path673"
				/>
				<path
					d="M 10.890849,8.4166433 10,9.4999998 l -1,-1 -1,1 H 6.663 C 6.0835085,10.721675 4.8521471,11.500279 3.5,11.5 0.74267715,11.499431 -0.93112019,8.4590312 0.5429231,6.1288963 2.0169664,3.7987613 5.48129,4.0087369 6.663,6.4999998 l 4.21517,0.024896 z M 2.5,8.9999998 c 1.3333328,0 1.3333328,-2 0,-2 -1.3333328,0 -1.3333328,2 0,2 z"
					id="path435"
				/>
				<path
					style="stroke-width:0.5; stroke: currentColor;"
					d="M 10.911796,6.0556381 C 9.8437819,4.6813918 9.8437819,4.6813918 9.8437819,4.6813918"
					id="path748"
				/>
				<path
					style="stroke-width:0.5; stroke: currentColor;"
					d="M 11.640449,6.1528371 12.440783,4.6549865"
					id="path750"
				/>
				<path
					style="stroke-width:0.5; stroke: currentColor;"
					d="M 12.246231,6.6612931 13.592026,6.3991949"
					id="path752"
				/>
			</svg>
		{:else}
			<svg
				id="auth_svg"
				fill="currentColor"
				viewBox="0 0 16 16"
				style="position:relative;top:6.5px"
			>
				<path
					d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
				/>
			</svg>
		{/if}
	</button>
</h1>

<p>
	{#if global.logged_in}
		This key <strong>identifies</strong><br />
		<b><code>{global.user}</code></b><br />
	{:else}
		Provides a key that <strong>identifies</strong><br />
		<span id="user">an <b>entity</b> that <strong>interacts</strong> 📡</span>
		<br />
	{/if}
	with <code id="host">{global.host}</code>.
</p>
