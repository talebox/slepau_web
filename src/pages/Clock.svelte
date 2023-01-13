<script>
	import { local_settings$ } from "../store";
	import { SECONDS } from "../utils/utils";
	import { parse } from "chrono-node";
	import { fade } from "svelte/transition";
	import { sineOut } from "svelte/easing";
	import { tick, onDestroy, onMount } from "svelte";
	// import { get } from "svelte/store";
	import suncalc from "@deps/suncalc";

	let input_new;
	let from_birth;
	let diff;
	let sun, moon, times;

	function update(settings) {
		let birth = parse(settings.birthday)?.[0];
		from_birth = settings.clock_force_apes ? false : !!birth;

		const now = BigInt(Math.floor(Date.now() / 1000)); // Seconds

		const start = from_birth
			? BigInt(Math.floor(birth.start.date().getTime() / 1000))
			: BigInt(-11970) * BigInt(SECONDS.Y);
		const years = (now - start) / BigInt(SECONDS.Y);
		const sol = ((now - start) % BigInt(SECONDS.Y)) / BigInt(SECONDS.d);
		diff = { sol, years };

		times = suncalc.getTimes(
			new Date(),
			settings.location[0],
			settings.location[1]
		);

		sun = suncalc.getPosition(
			new Date(),
			settings.location[0],
			settings.location[1]
		);
		moon = suncalc.getMoonPosition(
			new Date(),
			settings.location[0],
			settings.location[1]
		);
	}

	// Updates values
	let clear;
	$: {
		update($local_settings$);
		clearInterval(clear);
		clear = setInterval(() => update($local_settings$), 10000);
	}

	onDestroy(() => clearInterval(clear));

	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// Trigger animation
	let show = true;
	async function changed() {
		show = false;
		await tick();
		show = true;
	}
	$: if (from_birth !== undefined) {
		changed();
	}

	let stats_opacity;
	let stats_timeout;
	function wake_up() {
		stats_opacity = 1;
		clearTimeout(stats_timeout);
		stats_timeout = setTimeout(() => (stats_opacity = 0.2), 4000);
	}
	wake_up();

	function toggle_fullscreen() {
		console.log("toggling");
		if (!document.fullscreenElement) {
			document.body.requestFullscreen();
		} else {
			console.log("exiting");
			document.exitFullscreen();
		}
	}
</script>

{#if show}
	<div
		class="time"
		on:click={() => {
			$local_settings$.clock_force_apes = !$local_settings$.clock_force_apes;
			changed();
		}}
		in:fade={{ duration: 2000, easing: sineOut }}
	>
		<div style="font-size:2em;margin-block:1em">
			<b>{diff.sol}</b> sols <b>{numberWithCommas(diff.years)}</b> years
		</div>
		<div style="font-size:1.2em">
			{from_birth ? "on Earth" : "since the Great Apes"}
		</div>
	</div>
{/if}

<div class="planet" in:fade>
	<div class="back" />
	<div
		class="sunlight"
		style:transform={`rotate(${sun.altitude * 2}rad)`}
		on:click={() => wake_up()}
	>
		<div class="dash" style:opacity={stats_opacity} />
	</div>

	<div />
</div>

<code
	class="stats"
	on:click={() => {
		wake_up();
	}}
	style:opacity={stats_opacity}
>
	coordinates: {`${$local_settings$.location?.[0]}, ${$local_settings$.location?.[1]}`}<br
	/>
	<p>
		Sun<br />
		altitude: {((sun.altitude / (Math.PI / 4)) * 90).toFixed(1)}°<br />
		azimuth: {((sun.azimuth / (2 * Math.PI)) * 360).toFixed(1)}° CW S
	</p>
	<p>
		Moon<br />
		altitude: {((moon.altitude / (Math.PI / 4)) * 90).toFixed(1)}°<br />
		azimuth: {((moon.azimuth / (2 * Math.PI)) * 360).toFixed(1)}° CW S <br />
		distance: {(moon.distance / 1000).toFixed(1)} Mm
	</p>
</code>

<button class="fullscreen" on:click={toggle_fullscreen}>Fullscreen</button>

<style>
	.fullscreen {
		position: fixed;
		padding: 0.5em;
		top: 50%;
		right: 0;
		transform: translate(0, -50%);
		opacity: 0.2;
		margin: 0;
	}
	.time {
		display: flex;
		flex-flow: column;
		align-items: center;

		cursor: pointer;
		margin: auto;
		margin-top: 5em;
		width: max-content;
		/* padding-block: max(10vw, 10vh); */
	}
	.planet {
		position: fixed;
		bottom: min(20vw, 20vh);
		left: 50%;
		transform: translate(-50%, 50%);
		width: max(min(80vw, 100vh), 720px);
		height: max(min(80vw, 100vh), 720px);
	}
	.back,
	.sunlight {
		cursor: pointer;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		transition: all 1s;
	}
	.back {
		background: grey;
		opacity: 0.1;
	}
	.sunlight {
		/* opacity: 0.5; */
		background: linear-gradient(to right, white, transparent, transparent);
	}
	.dash {
		transition: all 1s;
		border-top: 2px dashed white;

		position: absolute;
		top: 50%;
		left: 0;
		width: 50%;
		height: 1px;
	}
	.stats {
		color: var(--color-main);
		background: transparent;
		transition: all 1s;
		font-size: 1em;
		position: fixed;
		cursor: pointer;
		opacity: 0.2;
		top: 0;
		left: 0;
	}
</style>
