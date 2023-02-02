/**
 * Mounts the svelte app
 */
import App from "./App.svelte"

// if (location.protocol === 'https:' && navigator.serviceWorker) navigator.serviceWorker.register(
// 	new URL('utils/service_worker.js', import.meta.url), {scope:'/app'}
// );
// navigator.serviceWorker?.getRegistrations().then(reg => console.log("Registrations:", reg))

// Remove loading element
document.getElementById("loading")?.classList.add("close");
setTimeout(() => {
	document.getElementById("preload")?.remove();
	document.getElementById("loading")?.remove();
}, 1000);


const app = new App({
	target: document.getElementById("app")
})