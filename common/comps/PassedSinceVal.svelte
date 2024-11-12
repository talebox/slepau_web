<script>
    import { onDestroy } from "svelte";
    import {
    passed_since_pretty,
    fraction_digits_chunk,
  } from "@utils/utils";

    export let epoch_seconds;
    export let fraction_digits = fraction_digits_chunk;
    export let passed_since;
    
    let clear;
    function update() {
        clearTimeout(clear);
        let v_d = passed_since_pretty(epoch_seconds, fraction_digits);
        if (v_d) {
            const [v, d] = v_d;
            display_string = v;
            clear = setTimeout(() => update(), d);
        }
    }
    $: if(epoch_seconds) {update()};
    onDestroy(() => clearTimeout(clear));
</script>