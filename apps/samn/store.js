import { SocketDB } from "../../common/stores/socket"
import { fetchE } from "@utils/network"
import { writable } from "svelte/store"
import notifications from "../../common/stores/notifications"
import { batch_upload } from "../../common/utils/utils"
import { fetchJson } from "../../common/utils/network"
import { setStatus } from "../../common/stores/status"

export const editing_id$ = writable()

class SamnDB extends SocketDB {
	constructor() {
		super("/stream")
	}
	/**
	 * Request update for view subscribers with at least 1 listener
	 */
	maybe_request_views() {
		Object.entries(this.subs).forEach(([k, v]) => {
			if (k.startsWith("views") && v.request_on) this.maybe_request_update(k)
		})
	}
	on_message(text) {
		let m = super.on_message(text)

		// Resource changes
		if (m.resource && typeof m.value === "undefined") {
			if (m.resource === "nodes") {
				this.maybe_request_views()
			} else if (m.resource.startsWith("nodes")) {
				this.maybe_request_update(m.resource)
			}
		}

		return m
	}
}

export const db = new SamnDB()
