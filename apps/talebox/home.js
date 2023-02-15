/**
 * Mounts the svelte app
 */
import Home from "./Home.svelte"

const appEl = document.getElementById("app");
appEl.style.opacity = 1;

const app = new Home({
	target: appEl
})