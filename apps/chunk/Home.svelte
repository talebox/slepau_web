<script>
	import {
		polarToCartesianForSvg as _pc,
		polarToCartesian,
	} from "@utils/utils_svg";
	import { tick } from "svelte";
	const pc = (a, r) => _pc(a, r, [50, 50]);

	let arcR = 30;
	let ticked = false;
	setTimeout(() => {
		ticked = true;
	}, 50);

	const circles = [];
	const num = 7,
		span = 1.7,
		start = 1.65;
	for (let i = 0; i < num; ++i) {
		circles.push({
			from: polarToCartesian(
				Math.PI * (start + (span / (num - 1)) * i),
				arcR + 18,
				[50, 50]
			),
			to: polarToCartesian(
				Math.PI * (start + (span / (num - 1)) * i),
				arcR + 8,
				[50, 50]
			),
		});
	}
</script>



<h1>Chunk</h1>
<p>Organize.</p>
<span
	>Go to app <svg viewBox="0 0 16 16" class="link">
		<path
			fill-rule="evenodd"
			d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
		/>
		<path
			fill-rule="evenodd"
			d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
		/>
	</svg></span
>

<svg viewBox="0 0 100 100" class="grouped">
	<path
		d="
	M{pc(Math.PI * 1.6, arcR)}
	A{arcR} {arcR} 0 0 0 {pc(Math.PI * 0.5, arcR)}
	A{arcR} {arcR} 0 0 0 {pc(Math.PI * 1.4, arcR)}
	"
	/>
	<a href="/app">
		<path
			fill="var(--selection)"
			stroke="none"
			class="clickable"
			d="M{pc(Math.PI * 1.6, arcR)}
			A{arcR} {arcR} 0 0 0 {pc(Math.PI * 0.5, arcR)}
			A{arcR} {arcR} 0 0 0 {pc(Math.PI * 1.4, arcR)}
			z"
		/>
	</a>
	{#each circles as c, i}
		<circle
			cx={c.from[0]}
			cy={c.from[1]}
			r={1.5}
			style:opacity={ticked ? 1 : 0}
			style:transform="translate({ticked ? c.to[0] - c.from[0] : 0}px,{ticked
				? c.to[1] - c.from[1]
				: 0}px)"
			style:transition="transform {2}s, opacity {2}s"
			style:transition-delay="{2 + i * 0.5}s, {i * 0.3}s"
		/>
	{/each}
</svg>

<style>
	.clickable {
		opacity: 0.1;
		/* transition: opacity 1s; */
	}
	.clickable:hover {
		opacity: 0.2;
	}
	svg.grouped {
		fill: none;
		position: absolute;
		stroke: currentColor;
		stroke-width: 0.5;
		top: -100%;
		left: 0;
		width: 100%;
		height: 300%;
		/* pointer-events: none; */
	}
	svg.link{
		fill:currentColor; 
		stroke:none; 
		height:1em;
		position: relative;
		top:.1em;
	}
	circle {
		will-change: opacity, transform;
	}
</style>
