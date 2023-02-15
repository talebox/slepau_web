<script>
	import { gear_path, polarToCartesian } from "@utils/utils_svg";
	import { fade } from "svelte/transition";

	const toothRatio = 22 / 8;
	const gears = {
		talebox: {
			teeth: 100,
			toothWidth: 2,
			toothHeight: 1.5,
			center: [50, 50],
			radius: 38,
			time: 120,
		},
		auth: {
			link: "https://auth.anty.dev",
			toothWidth: 1.7,
			toothHeight: 1.4,
			radius: 8,
			center: [50, 80],
			offset: 0.55,
		},
		chunk: {
			link: "https://chunk.anty.dev",
			toothWidth: 1.7,
			toothHeight: 1.4,
			inactive: true,
			radius: 12,
			center: polarToCartesian(0.8 * Math.PI, 20).map((x) => x + 50),
		},
		media: {
			toothWidth: 1.7,
			toothHeight: 1.4,
			inactive: true,
			radius: 9,
			center: polarToCartesian(0.2 * Math.PI, 16).map((x) => x + 50),
		},
	};
	{
		let d = "M1 50";
		d += "A 49 49 0 0 1 99 50";
		d += "A 49 49 0 0 1 1 50";
		d += "z";
		d += gear_path(gears.talebox);
		gears.talebox.path = d;
	}

	Object.entries(gears).forEach(([k, v]) => {
		if (!v.teeth) {
			v.teeth = Math.floor(toothRatio * v.radius);
		}
		if (!v.time) {
			v.time = (gears.talebox.time / gears.talebox.teeth) * v.teeth;
		}
		if (!v.path) {
			v.path = gear_path(v);
		}
	});
</script>

<svg
	stroke="currentColor"
	stroke-width="0.2"
	fill="var(--background)"
	viewBox="0 0 100 100"
>
	{#each Object.entries(gears) as [name, gear]}
		<a href={gear.link}>
			<g
				class="gear"
				class:inactive={gear.inactive}
				style:animation-duration="{gear.time}s"
			>
				<path d={gear.path} />

				<text
					x={gear.center[0]}
					y={name === "talebox" ? 7.9 : gear.center[1] + 0.5}
					fill="var(--text-main)"
					text-anchor="middle"
					font-weight="normal"
					font-size={name === "talebox" ? 6 : 3}
					stroke="none">{name[0].toUpperCase() + name.substring(1)}</text
				>
			</g>
		</a>
	{/each}
</svg>

<style>
	svg {
		--s: min(100vw, 100vh);
		width: var(--s);
		height: var(--s);
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
		animation: rotate 60s infinite linear forwards;
		transition: all 0.5s;
		user-select: none;
		transform-box: fill-box;
	}
	a[href] .gear:hover {
		fill: var(--selection)
	}
	.gear.inactive {
		opacity: 0.4;
		animation: none;
	}
</style>
