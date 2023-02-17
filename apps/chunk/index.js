/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading";

// Return if public.
if (globalThis.user?.user === "public") return;

// Setup service worker
if (location.protocol === 'https:' && navigator.serviceWorker) navigator.serviceWorker.register(
	new URL('/common/utils/service_worker.js', import.meta.url), { scope: '/' }
);
navigator.serviceWorker?.getRegistrations().then(reg => console.log("Registrations:", reg))

// Remove loading
remove_loading();

// Mount app
const app = new Index({
	target: document.getElementById("app"),
	props: {}
})