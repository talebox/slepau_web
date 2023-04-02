/**
 * Mounts the svelte app
 */
import Home from "./Home.svelte"
import HomeLocal from "./HomeLocal.svelte"

const appEl = document.getElementById("app");
appEl.style.opacity = 1;
const app = new Home({
	target: appEl
})


if (
	process.env.NODE_ENV === "production" && 
	window.location.hostname.endsWith(".local")
) {
	const appEl = document.getElementById("app-local");
	while (appEl.firstChild) {
		appEl.removeChild(appEl.firstChild)
	}
	const app = new HomeLocal({
		target: document.getElementById("app-local")
	})
}