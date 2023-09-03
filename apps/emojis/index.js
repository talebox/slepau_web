/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"

// Remove loading element
document.getElementById("loading")?.classList.add("close");
setTimeout(() => {
	document.getElementById("preload")?.remove();
	document.getElementById("loading")?.remove();
}, 200);


const app = new Index({
	target: document.getElementById("app")
})