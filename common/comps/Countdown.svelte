<script>
	export let date;
	
	// $: modified = chunk?.modified;
	// $: created = chunk?.created;

	let until;
	// let cstring;
	let clear;
	function update(date) {
		clearInterval(clear);
		
		const _s = passed_since_pretty(date)
		if (_s) {
			const [s, delay_ms] = _s;
				
			clear = setTimeout(() => update(modified, created), delay_ms);
		}
	}
	$: update(date);
	onDestroy(() => clearInterval(clear));
	
	
	if (!date){
		
	}
</script>

