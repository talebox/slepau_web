/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading"

// Mount app
new Index({
	target: document.getElementById("app"),
})
remove_loading()