<script>
	import { gear_path, polarToCartesian } from "@utils/utils_svg";
	import { fade } from "svelte/transition";

	const toothRatio = 22 / 8;
	let gears = {
		auth: {
			link: globalThis.HOSTS.auth.href,
			toothWidth: 1.7,
			toothHeight: 1.4,
			radius: 8,
			driving: true,
			center: [50, 50],
			// center: [50, 80],
			pos_engaged: polarToCartesian(1.25 * Math.PI, 30),
			toothOffset: 0.3,
		},
		chunk: {
			link: globalThis.HOSTS.chunk.href,
			toothWidth: 1.7,
			toothHeight: 1.4,
			inactive: false,
			radius: 12,
			center: [50, 50],
			pos_engaged: polarToCartesian(0.8 * Math.PI, 26),
			toothOffset: 0.25,
			// center: polarToCartesian(0.8 * Math.PI, 26).map((x) => x + 50),
		},
		media: {
			link: globalThis.HOSTS.media.href,
			toothWidth: 1.7,
			toothHeight: 1.4,
			inactive: true,
			radius: 9,
			center: [50, 50],
			toothOffset: 0.47,
			pos_engaged: polarToCartesian(0.25 * Math.PI, 29),
			// center: polarToCartesian(0.2 * Math.PI, 29).map((x) => x + 50),
			// center_inactive: polarToCartesian(0.2 * Math.PI, 29).map((x) => x + 50),
		},

		talebox: {
			teeth: 100,
			toothWidth: 2,
			toothHeight: 1.5,
			center: [50, 50],
			radius: 38,
			time: 120,
		},
	};

	if (
		window.location.hostname === "talebox.dev" ||
		process.env.NODE_ENV === "development"
	) {
		gears.gibos = {
			link: globalThis.HOSTS.gibos.href,
			toothWidth: 1.7,
			toothHeight: 1.4,
			inactive: true,
			radius: 9,
			center: [50, 50],
			toothOffset: 0.47,
			pos_engaged: polarToCartesian(1.75 * Math.PI, 29),
			// center: polarToCartesian(0.2 * Math.PI, 29).map((x) => x + 50),
			// center_inactive: polarToCartesian(0.2 * Math.PI, 29).map((x) => x + 50),
		};
	}

	{
		let d = "M1 50";
		d += "A 49 49 0 0 1 99 50";
		d += "A 49 49 0 0 1 1 50";
		d += "z";
		d += gear_path(gears.talebox);
		gears.talebox.path = d;
	}

	function deterministic_offset(rot_time) {
		const now_seconds = Date.now() / 1000;
		return now_seconds % rot_time;
	}

	Object.entries(gears).forEach(([k, v]) => {
		// Figure out teeth based on toothRatio
		if (!v.teeth) {
			v.teeth = Math.floor(toothRatio * v.radius);
		}
		v.pos_engaged = v.pos_engaged ?? [0, 0];
		// Figure out time based on teeth compared to main teeth
		if (!v.time) {
			v.time = (gears.talebox.time / gears.talebox.teeth) * v.teeth;
		}

		v.offset = deterministic_offset(v.time);

		// Figure out path
		if (!v.path) {
			v.path = gear_path(v);
		}
	});

	function toggle(name = undefined, active = undefined) {
		gears = Object.fromEntries(
			Object.entries(gears).map(([k, v]) => {
				if (
					typeof name === "string"
						? // If name is defined, only toggle the name
						  k === name
						: // If name undefined, toggle all which have inactive defined
						  typeof v.inactive !== "undefined"
				) {
					v.inactive = typeof active !== "undefined" ? !active : !v.inactive;
					v.offset = deterministic_offset(v.time);
				}
				return [k, v];
			})
		);
		console.log(gears);
	}

	const t_r = 4.1;
</script>

<svg
	stroke="currentColor"
	stroke-width="0.2"
	fill="var(--background)"
	viewBox="0 0 100 100"
>
	{#each Object.entries(gears) as [name, gear]}
		<g
			class=""
			style="transition: all 1s"
			class:inactive={gear.inactive}
			style:transform="
			translate({gear.pos_engaged[0] * (gear.inactive ? 0.7 : 1)}px, {gear
				.pos_engaged[1] * (gear.inactive ? 0.7 : 1)}px)"
		>
			<a href={gear.link}>
				<g
					class="gear"
					class:inactive={gear.inactive}
					style:animation-duration="{gear.time}s"
					style:animation-delay="{-gear.offset}s"
				>
					<path d={gear.path} />

					{#if name === "talebox"}
						<path
							id="t_path"
							d="
						M {polarToCartesian(Math.PI * 0.6, gear.radius + t_r, [50, 50]).join(' ')}
						A {gear.radius + t_r} {gear.radius + t_r} 0 0 1 {polarToCartesian(
								Math.PI * 0,
								gear.radius + t_r,
								[50, 50]
							).join(' ')}
						Z
						"
							style="stroke:none;fill:none;"
						/>
						<path
							id="t_path2"
							d="
						M {polarToCartesian(Math.PI * 1.6, gear.radius + t_r, [50, 50]).join(' ')}
						A {gear.radius + t_r} {gear.radius + t_r} 0 0 1 {polarToCartesian(
								Math.PI * 1,
								gear.radius + t_r,
								[50, 50]
							).join(' ')}
						Z
						"
							style="stroke:none;fill:none;"
						/>
						<text font-size="6" style="font-weight:bold;text-anchor:start">
							<textPath href="#t_path">Talebox</textPath>
						</text>
						<text font-size="6" style="font-weight:normal;text-anchor:start">
							<textPath href="#t_path2">your story</textPath>
						</text>
					{:else}
						<text
							x={gear.center[0]}
							y={name === "talebox" ? 7.9 : gear.center[1] - 0.4}
							font-size={name === "talebox" ? 6 : 3}
							>{name[0].toUpperCase() + name.substring(1)}
						</text>
						{#if gear.link}<text
								x={gear.center[0]}
								y={name === "talebox" ? 7.9 : gear.center[1] - 0.4}
								dx="0"
								dy="4"
								font-size={name === "talebox" ? 6 : 3}>🔗</text
							>{/if}
					{/if}
				</g>
			</a>
		</g>
	{/each}
	<text x="50" y="50" font-size="2"> Instance at </text>
	<text x="50" y="55" font-size="3" style="fill: var(--code)">
		{window.location.origin}
	</text>
	<!-- {#if process.env.NODE_ENV === "production" && window.location.hostname.endsWith(".local")} -->
	<!-- {/if} -->
</svg>
{#if process.env.NODE_ENV === "development"}
	<button on:click={() => toggle()}>Toggle</button>
{/if}

<style>
	svg {
		/* --s: min(100vw, 100vh); */
		/* width: var(--s); */
		/* height: var(--s); */
		width: 100%;
		height: 100%;
	}
	text {
		fill: var(--text-main);
		stroke: none;
		font-weight: normal;
		text-anchor: middle;
	}
	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.gear {
		transform-origin: center;
		animation: rotate 60s infinite linear;
		transition: all 1s;
		user-select: none;
		transform-box: fill-box;
		stroke: var(--text-main);
	}
	a[href] .gear {
		stroke: var(--selection);
	}
	a[href] .gear:hover {
		fill: var(--selection);
	}
	.gear.driving {
		fill: var(--focus);
	}
	.gear.inactive {
		opacity: 0.4;
		animation: none;
	}
</style>
