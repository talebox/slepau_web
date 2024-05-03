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
		if (m.resource && !m.value) {
			if (m.resource === "nodes") {
				this.maybe_request_views()
			} else if (m.resource.startsWith("nodes")) {
				// Request update for resource
				this.maybe_request_update(m.resource)
				// Request update for nodes
				this.maybe_request_update("views/nodes")
				// Request update for any view that includes that specific node
				Object.keys(this.subs)
					.filter(v => v.startsWith("views/") && v.includes(m.resource))
					.forEach(v => this.maybe_request_update(v))
			}
		}

		return m
	}
}

export const db = new SamnDB()

export const actions = {
	setLimb: {
		light: (node_id, limb_id, value) =>
			setStatus(fetchJson("/command", {
				body: {
					for_id: node_id,
					command: { SetLimb: [limb_id, { Actuator: { Light: value } }] },
				}
			}), { on_resolve: "Light command queued" })
	},
	setUiData: (node_id, ui_data) => db.send({resource: `edit/${node_id}`, value: JSON.stringify(ui_data)})
}

export const period = writable(Number(localStorage.getItem("period")) || 3600);
period.subscribe((v) => {
	localStorage.setItem("period", v)
})

const get_limit = () => window.innerWidth < 500 ? 12 : 24;
export const limit = writable(get_limit())
window.addEventListener("resize", () => limit.set(get_limit()));