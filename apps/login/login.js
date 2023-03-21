/**
 * Mounts the svelte app
 */
import Login from "./Login.svelte"


const app = new Login({
	target: document.getElementById("app")
})