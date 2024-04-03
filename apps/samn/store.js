import { SocketDB } from "../../common/stores/socket"
import { fetchE } from "@utils/network"
import { decode } from "proquint";
import { writable } from "svelte/store"
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

export const actions = {
	setLimb: {
		light: (node_id, limb_id, value) =>
			setStatus(fetchJson("/command/wait", {
				body: {
					for_id: node_id,
					command: { SetLimb: [decode(limb_id)[0], { Actuator: { Light: value } }] },
				}
			}), {timeout: 30 * 1000}).then(v => { db.maybe_request_views(); return v })
	},
}

export const period = writable(Number(localStorage.getItem("period")) || 3600);
period.subscribe((v) => {
	localStorage.setItem("period", v)
})

const get_limit = () => window.innerWidth < 500 ? 12 : 24;
export const limit = writable(get_limit())
window.addEventListener("resize", () => limit.set(get_limit()));