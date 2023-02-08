/**
 * Mounts the svelte app
 */
import Preview from "./Preview.svelte"

new Preview({
	target: document.getElementById("app"),
	props: {}
})
