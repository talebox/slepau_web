<script>
	import { user } from "../../common/stores/user";

	function auth_click() {
		if (logged_in) {
			fetch("/auth/logout").then(
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

	let claims = {};
	let logged_in = false;
	user.then((v) => {
		claims = v.claims;
		logged_in = v.logged_in;
	});

	$: color = claims?.super ? "#B3664C" : claims?.admin ? "#4C99B3" : "#4AB595";

	const color_alpha = (color, a) => (color && a ? color + a : color);
	setTimeout(resize, 50);

	let domain;
	{
		const temp = location.host.split(".").reverse();
		domain = temp[1] + "." + temp[0];
	}
</script>

<svelte:window on:resize={resize} />

{#if logged_in}
	<div
		style="position: absolute; top:-30vh;left:0;width:100vw;height:100vh;opacity:0.2;overflow:hidden;pointer-events:none"
	>
		<svg
			bind:this={svg}
			id="auth_svg"
			fill="#8888"
			stroke="currentColor"
			stroke-width=".05"
			viewBox="0 0 16 16"
			style="position:absolute;top:0;left:0;width:100%;height:100%"
		>
			<path
				d="
        M3.5 11.5 
        a3.5 3.5 0 1 1 3.163 -5 
        H14 
        L15.5 8 14 9.5 
        l-1-1-1 1-1-1-1 1-1-1-1 1
        H6.663
        a3.5 3.5 0 0 1 -3.163 2
        z
        M2.5 9
        a1 1 0 1 0 0-2 1 1 0 0 0 0 2
        z"
			/>
			<circle cx="3.5" cy="11.5" r=".2" stroke="currentColor" />
			<circle cx="6.663" cy="6.5" r=".2" stroke="currentColor" />
			<text
				x="6.9"
				y="8.1"
				style="fill:var(--text-main);font-size:2px"
				textLength="7.1px"
				lengthAdjust="spacingAndGlyphs"
				stroke="none"
			>
				{claims.user}
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
		style:outline={logged_in ? "1px solid #F008" : "2px solid #0F0A"}
		on:click={auth_click}
		title={logged_in ? "Break Key" : "Create Key"}
	>
		{#if logged_in}
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
	{#if logged_in}
		This key <strong>identifies</strong><br />
		<b>
			<span
				style={`padding:2.5px 5px;background:${color_alpha(
					color,
					"60"
				)};border-radius:6px`}
				>{claims.super ? "super admin" : claims.admin ? "admin" : "user"}</span
			> <code>{claims.user}</code></b
		><br />
	{:else}
		The key<br />
		<strong>identifies</strong><br />
		<span id="user">an <b>entity</b> that <strong>interacts</strong> 📡</span>
		<br />
	{/if}
	with 
	<!-- <code>{domain}</code> -->
	<b>Talebox</b>
	.
</p>

{#if claims.admin}
	<a href={`${globalThis.PREFIX}/app`}>
		<button style:background={color_alpha(color, "80")}>
			Go to panel <svg
				fill="currentColor"
				viewBox="0 0 16 16"
				style="position:relative;top:.14em"
			>
				<path
					d="M11.5 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5Zm2 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5Zm-10 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6ZM5 3a1 1 0 0 0-1 1h-.5a.5.5 0 0 0 0 1H4v1h-.5a.5.5 0 0 0 0 1H4a1 1 0 0 0 1 1v.5a.5.5 0 0 0 1 0V8h1v.5a.5.5 0 0 0 1 0V8a1 1 0 0 0 1-1h.5a.5.5 0 0 0 0-1H9V5h.5a.5.5 0 0 0 0-1H9a1 1 0 0 0-1-1v-.5a.5.5 0 0 0-1 0V3H6v-.5a.5.5 0 0 0-1 0V3Zm0 1h3v3H5V4Zm6.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2Z"
				/>
				<path
					d="M1 2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 9H1V8H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6H1V5H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 2H1Zm1 11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11Z"
				/>
			</svg></button
		>
	</a>
{/if}
