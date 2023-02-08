/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"

if (location.protocol === 'https:' && navigator.serviceWorker) navigator.serviceWorker.register(
	new URL('/common/utils/service_worker.js', import.meta.url), {scope:'/app'}
);
navigator.serviceWorker?.getRegistrations().then(reg => console.log("Registrations:", reg))

// Remove loading element
document.getElementById("loading")?.classList.add("close");
setTimeout(() => {
	document.getElementById("preload")?.remove();
	document.getElementById("loading")?.remove();
}, 200);


const app = new Index({
	target: document.getElementById("app"),
	props: {}
})