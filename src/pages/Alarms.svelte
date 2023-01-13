<script>
	import { local_settings$ } from "../store";
	import { SECONDS, seconds_to_short } from "../utils/utils";
	import { parse } from "chrono-node";

	// $local_settings$.alarms

	let input_new;
</script>

{#each $local_settings$.alarms as alarm}
	<div>
		{#if alarm.every} Every {seconds_to_short(alarm.every)}{/if}
	</div>
{/each}

<div>
	<input bind:this={input_new} />
	<button>Add Alarm</button>
</div>

<style>
</style>
