<script>
	import { local_settings$ } from "../store";
	import { SECONDS, second_to_pretty } from "../utils/utils";
	import { parseDate } from "chrono-node";

	let input_new;
	function add() {
		if (!input_new) return;
		const date = parseDate(input_new.value);
		let every = /every (\d+)(\w)$/i.exec(input_new.value);
		if (every) {
			const multiplier = SECONDS[every[2]],
				num = Number(every[1]);
			every = multiplier && num ? num * multiplier : undefined;
		}
		if (!date) return;
		$local_settings$.alarms.push({ date, every });
		$local_settings$.alarms = $local_settings$.alarms;
	}
	
</script>


<h1>Alarms</h1>
<p>
	Made to test the <a
		href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/alarms"
		>alarms javascript api</a
	>.<br />
	These are stored in the browser's <code>localStorage</code>.
</p>

{#each $local_settings$.alarms as alarm}
	<div>
		{alarm.date}
		{#if alarm.every} every {second_to_pretty(alarm.every)}{/if}
	</div>
{/each}

<div>
	<input bind:this={input_new} placeholder="tomorrow at 2, every 2d" />
	<button on:click={add}>Add Alarm</button>
</div>

<style>
</style>
