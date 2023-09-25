/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"

import remove_loading from "@utils/remove_loading"
import { user_assert_admin } from "@stores/user"

const message = document.getElementById("loading-message")
const icon = document.getElementById("loading-icon")
const login = document.getElementById("loading-login")

message.innerText = "Figuring out who you are..."

user_assert_admin().then(
	(m) => {
		message.innerText = m

		// Remove loading
		remove_loading()

		// Mount app
		new Index({
			target: document.getElementById("app"),
		})
	},
	(err_m) => {
		message.innerText = err_m
		icon.style.display = "none"
		login.style.display = "initial"
	}
)
