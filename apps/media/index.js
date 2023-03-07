/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading"
// import setup_service_worker from "@utils/setup_service_worker"

// Return if public.
if (globalThis.user?.user === "public") return

// Setup service worker
// setup_service_worker()

// Remove loading
remove_loading()

// Mount app
const app = new Index({
  target: document.getElementById("app"),
  props: {},
})
