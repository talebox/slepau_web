/**
 * Mounts the svelte app
 */
import Index from "./Index.svelte"
import remove_loading from "@utils/remove_loading"
// import setup_service_worker from "@utils/setup_service_worker"

const message = document.getElementById("loading-message")
const icon = document.getElementById("loading-icon")
const login = document.getElementById("loading-login")

message.innerText = "Figuring out who you are..."

fetch("/auth/user")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((claims) =>
    claims.user !== "public" ? Promise.resolve() : Promise.reject()
  )
  .then(
    () => {
      message.innerText = "Hello (ʘ‿ʘ)╯"

      // Setup service worker
      // setup_service_worker()

      // Remove loading
      remove_loading()

      // Mount app
      new Index({
        target: document.getElementById("app"),
      })
    },
    () => {
      message.innerText = "Who are you (⊙_⊙')?"
      icon.style.display = "none"
      login.style.display = "initial"
    }
  )
