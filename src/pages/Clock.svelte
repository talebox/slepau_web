<script>
	import { is_phone$, local_settings$ } from "../store";
	import { SECONDS, second_to_pretty } from "../utils/utils";
	import { parse } from "chrono-node";
	import { fade, slide } from "svelte/transition";
	import { sineOut } from "svelte/easing";
	import { tick, onDestroy, onMount } from "svelte";
	import suncalc from "@deps/suncalc";

	let from_birth;
	let diff, passed_secs;
	let sun, moon, times, now_date;
	let miday_altitude = 0;
	let sun_angle = 0;
	let offset = 0;
	let sun_trace = []; // Trace of all points

	function update(settings, offset) {
		let birth = parse(settings.birthday)?.[0];
		from_birth = settings.clock_force_apes ? false : !!birth;

		const now = BigInt(Math.floor(Date.now() / 1000 + offset)); // Seconds
		now_date = new Date(Number(now) * 1000);

		const start = from_birth
			? BigInt(Math.floor(birth.start.date().getTime() / 1000))
			: BigInt(-11970n) * BigInt(Math.floor(SECONDS.Y));
		const years = (now - start) / BigInt(Math.floor(SECONDS.Y));
		let sol = (now - start) % BigInt(Math.floor(SECONDS.Y));
		passed_secs = sol % BigInt(SECONDS.d);
		sol = sol / BigInt(SECONDS.d);
		diff = { sol, years };

		times = suncalc.getTimes(
			now_date,
			settings.location[0],
			settings.location[1]
		);

		miday_altitude = suncalc.getPosition(
			times.solarNoon,
			settings.location[0],
			settings.location[1]
		).altitude;
		sun = suncalc.getPosition(
			now_date,
			settings.location[0],
			settings.location[1]
		);

		moon = suncalc.getMoonPosition(
			now_date,
			settings.location[0],
			settings.location[1]
		);

		{
			// spehrical -> cartesian.
			const y = Math.sin(sun.altitude),
				x = Math.sin(sun.azimuth);
			// cartesian -> polar.
			sun_angle = Math.atan(y / x) + (sun.azimuth < 0 ? Math.PI : 0);
		}
		{
			const day_start = new Date(
				now_date.getFullYear(),
				now_date.getMonth(),
				now_date.getDate()
			);
			sun_trace = [];
			const a = 100;
			for (let i = 0; i < a; i++) {
				const sun = suncalc.getPosition(
					new Date(day_start.getTime() + (SECONDS.d / a) * i * 1000),
					settings.location[0],
					settings.location[1]
				);
				// Pushing x, y
				sun_trace.push([Math.sin(sun.azimuth), Math.sin(sun.altitude)]);
			}
		}
	}

	// Updates values
	let clear;
	$: {
		update($local_settings$, offset);
		clearInterval(clear);
		clear = setInterval(() => update($local_settings$, offset), 10000);
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
		stats_timeout = setTimeout(
			() => (stats_opacity = $is_phone$ ? 0 : 0.2),
			4000
		);
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
	// $: console.log(sun_trace)
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
		{#if offset}
			<div transition:slide style="color: green;">
				+ {second_to_pretty(offset)}
			</div>
		{/if}
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
	{#if stats_opacity > 0.2}
		<svg
			style="width: 40%;height:40%;position:absolute;left:50%;top:50%;transform: translate(-50%,-50%)"
			viewBox="-100 -100 200 200"
			fill="currentColor"
			stroke="currentColor"
		>
			{#each sun_trace as t}
				<circle cx={t[0] * 100} cy={-t[1] * 100} r="0.1" />
			{/each}
		</svg>
	{/if}
	<div class="you" />
	<div
		class="sunlight"
		style:transform={`rotate(${sun_angle}rad)`}
		style:background={`linear-gradient(to right, white, transparent ${
			50 + Math.cos(sun.azimuth) * 20
			// Math.sin(miday_altitude) * 50
		}%, transparent)`}
		on:click={() => wake_up()}
	>
		<div class="dash" style:opacity={stats_opacity} />
	</div>

	<div class="" ></div>
</div>

{#if !$is_phone$}
	<code
		class="stats"
		on:click={() => {
			wake_up();
		}}
		style:opacity={stats_opacity}
	>
		coordinates: {`${$local_settings$.location?.[0]}, ${$local_settings$.location?.[1]}`}<br
		/>
		passed: {second_to_pretty(Number(passed_secs))}<br />
		<input type="range" bind:value={offset} min={0} max={SECONDS.d} />
		<p>
			Sun<br />
			altitude: {((sun.altitude / Math.PI) * 180).toFixed(1)}°<br />
			azimuth: {((sun.azimuth / Math.PI) * 180).toFixed(1)}° CW S<br />
			<!-- x: {Math.sin(sun.azimuth).toFixed(1)}, y: {Math.sin(sun.altitude).toFixed(
				1
			)}<br /> -->
		</p>
		<p>
			Moon<br />
			altitude: {((moon.altitude / Math.PI) * 180).toFixed(1)}°<br />
			azimuth: {((moon.azimuth / Math.PI) * 180).toFixed(1)}° CW S <br />
			distance: {(moon.distance / 1000).toFixed(1)} Mm
		</p>
	</code>

	<button class="fullscreen" on:click={toggle_fullscreen}>Fullscreen</button>
	<div class="now" style:opacity={stats_opacity}>
		{`${now_date.getHours()}:${now_date.getMinutes().toString().padStart(2,"0")}`}
	</div>
{/if}
<div class="stats-nice">
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M7.646 1.146a.5.5 0 0 1 .708 0l1.5 1.5a.5.5 0 0 1-.708.708L8.5 2.707V4.5a.5.5 0 0 1-1 0V2.707l-.646.647a.5.5 0 1 1-.708-.708l1.5-1.5zM2.343 4.343a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7zm3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"
		/>
	</svg>
	{`${times.sunrise.getHours()}:${times.sunrise.getMinutes().toString().padStart(2,"0")}`}
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M7.646 4.854a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V1.5a.5.5 0 0 0-1 0v1.793l-.646-.647a.5.5 0 1 0-.708.708l1.5 1.5zm-5.303-.51a.5.5 0 0 1 .707 0l1.414 1.413a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .706l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7zm3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"
		/>
	</svg>
	{`${times.sunset.getHours()}:${times.sunset.getMinutes().toString().padStart(2,"0")}`}
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
		/>
	</svg>
	{second_to_pretty((times.sunset - times.sunrise) / 1000, 1)}
	<svg fill="currentColor" viewBox="0 0 16 16">
		<path
			d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm.5-9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5-5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm-11 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9.743-4.036a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707zm-7.779 7.779a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707zm7.072 0a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707zM3.757 4.464a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707z"
		/>
	</svg>
	{`${times.nadir.getHours()}:${times.nadir.getMinutes().toString().padStart(2,"0")}`}
</div>

<style>
	.now {
		position: fixed;
		top: 8px;
		left: 50%;
		transform: translate(-50%, 0);
	}
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
	.you {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translate(-50%, -100%);
		width: 3px;
		height: 3px;
		background: #0a6;
		border-radius: 9999px;
	}
	.planet {
		position: fixed;
		bottom: min(20vw, 20vh);
		left: 50%;
		transform: translate(-50%, 50%);
		width: max(min(90vw, 100vh), 600px);
		height: max(min(90vw, 100vh), 600px);
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
		transition: all 0.2s;
	}
	.back {
		background: grey;
		opacity: 0.1;
	}
	.sunlight {
		/* opacity: 0.5; */
		/* background: ; */
		transition: initial;
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
	.stats-nice {
		position: fixed;
		top: 0;
		right: 0;
		font-size: 1.3em;
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin: 8px;
	}
	@media (max-width: 768px) {
		.stats-nice {
			left: 0;
			width: 100%;
			display: flex;
			flex-flow: row wrap;
		}
	}
</style>
