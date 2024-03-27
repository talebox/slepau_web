<script>
	const { default: NodeHeader } = require("./NodeHeader.svelte");

	// Just a test
	let last = false;
	let res = Promise.resolve("nothing yet");
	function toggle() {
		last = !last;
		res = fetch("/command/wait", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				for_id: 14,
				command: { SetActuator: { id: 0, value: { Light: last } } },
			}),
		}).then((v) => v.json());
	}
</script>

<NodeHeader />
<!-- All graphs -->

<h4>Just a test</h4>
<button on:click={toggle}>Toggle</button>
{#await res}
	Waiting...
{:then res}
	Got: {res}
{/await}
