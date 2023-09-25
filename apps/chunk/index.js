/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading"
import setup_service_worker from "@utils/setup_service_worker"
import { user_assert_logged_in } from "@stores/user"

const message = document.getElementById("loading-message")
const icon = document.getElementById("loading-icon")
const login = document.getElementById("loading-login")

message.innerText = "Figuring out who you are..."

user_assert_logged_in().then(
	(m) => {
		message.innerText = m

		// Setup service worker
		if (globalThis.URL_IS_LOCAL) setup_service_worker()

		// Remove loading
		remove_loading()

		// Mount app
		new Index({
			target: document.getElementById("app"),
		})
	},
	(m) => {
		message.innerText = m
		icon.style.display = "none"
		login.style.display = "initial"
	}
)
