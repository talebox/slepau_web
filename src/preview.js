/**
 * Mounts the svelte app
 */
import PreviewApp from "./PreviewApp.svelte"

new PreviewApp({
	target: document.getElementById("app"),
	props: {}
})
