/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading"
import { user_assert_super } from "@stores/user"

const message = document.getElementById("loading-message")
const icon = document.getElementById("loading-icon")
const login = document.getElementById("loading-login")

message.innerText = "Figuring out who you are..."

user_assert_super.then(
	() => {
		message.innerText = "Hello super (ʘ‿ʘ)╯"

		// Remove loading
		remove_loading()

		// Mount app
		new Index({
			target: document.getElementById("app"),
		})
	},
	() => {
		message.innerText = "You need to be a super (⊙_⊙')?"
		icon.style.display = "none"
		login.style.display = "initial"
	}
)
