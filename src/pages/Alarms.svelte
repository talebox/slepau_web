<script>
	import { local_settings$ } from "../store";
	import { SECONDS, passed_since_pretty } from "../utils/utils";
	import { parse } from "chrono-node";

	// $local_settings$.alarms

	let input_new;
</script>

{#each $local_settings$.alarms as alarm}
	<div>
		{#if alarm.every} Every {passed_since_pretty(alarm.every)}{/if}
	</div>
{/each}

<div>
	<input bind:this={input_new} />
	<button>Add Alarm</button>
</div>

<style>
</style>
