/**
 * Mounts the svelte app
 */
import App from "./App.svelte"


// Remove loading element
document.getElementById("loading")?.classList.add("close");
setTimeout(() => {
	document.getElementById("preload")?.remove();
	document.getElementById("loading")?.remove();
}, 1000);


const app = new App({
  target: document.getElementById("app"),
  props: {}
})
