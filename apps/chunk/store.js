/**
 * App specific store
 */
import { writable, get } from "svelte/store"
import { fetchJson, fetchE } from "@utils/network"
import { setStatus } from "/common/stores/status"
import { SocketDB } from "../../common/stores/socket"
import media from "../../common/stores/media"

class ChunkDB extends SocketDB {
	constructor() {
		super("/chunk/stream")
	}
	on_open() {
		super.on_open()

		Object.entries(this.subs).forEach(
			([k, v]) =>
				v.listening &&
				v.request_on !== false &&
				this.send({ resource: v.resource })
		)
	}
	/**
	 * Request update for view subscribers with at least 1 listener
	 */
	maybe_request_views() {
		Object.entries(this.subs).forEach(([k, v]) => {
			if (k.startsWith("views")) this.maybe_request_update(k)
		})
	}
	on_message(event) {
		let m = super.on_message(event)

		if (m.resource && m.value && m.type != "Err") {
			// If it's a diff for a chunk
			// update the chunk's subscription by applying it
			// So views on everyone change when just sending them diffs
			if (m.resource.endsWith("/diff")) {
				const resource = m.resource.replace(/\/diff$/, "")
				const sub = this.subs[resource]

				if (resource.startsWith("chunks/")) {
					if (resource.endsWith("/value")) {
						sub?.update((v) => {
							if (!v) {
								// If v is null, another user gave us access
								// but we can't apply diff because we don't have base value yet.
								// Try requesting a value if anyone is listening.
								// maybe_request_update(resource)
								return v
							}
							let r = applyDiff(v, m.value)[0]
							return r
						})
					}
				}
			}
		}

		// Resource changes
		if (m.resource && !m.value) {
			if (m.resource === "chunks") {
				this.maybe_request_views()
			}
		}

		return m
	}
}

export const db = new ChunkDB()

let notification_id;

export const actions = {
	
	auth: {
		patch: (v) =>
			setStatus(fetchJson("/auth/user", { body: v, method: "PATCH" }).then((v) => v.json()))
	},
	chunks: {
		del: (v) =>
			setStatus(fetchJson("/chunk/chunks", { body: v, method: "DELETE" })),
		put: (id, value) =>
			db.send(
				{ resource: `chunks/${id}/value`, value },
				(v, sub) => {
					sub?.update((v) => value)
					setStatus(Promise.resolve("Saved"))
				},
				(v, sub) => sub?.update((v) => v)
			),
		new: (value) =>
			setStatus(
				fetchJson("/chunk/chunks", {
					body: { value: value ?? "# New Chunk\n\n" },
					method: "PUT",
				})
			),
	},
	media: {
		...media,
		post_many: (...v) => media.post_many(...v).then(v => db.maybe_request_views())
	},
}

export const editing_id$ = writable()

export const store = {
	local_settings$: (() => {
		const _default = {
			wants_preview: false,
			editing_id: undefined,
			zoom: 1,
			alarms: [],
			location: [25.70627, -80.1999],
		}
		function get_settings() {
			try {
				const settings = localStorage.getItem("settings")
				return { ..._default, ...((settings && JSON.parse(settings)) || {}) }
			} catch {
				return _default
			}
		}
		function save(v) {
			if (typeof v == "object")
				localStorage.setItem("settings", JSON.stringify(v))
		}
		const { set, update, ...o } = writable(get_settings())

		return {
			set: (v) => {
				set(v)
				save(v)
			},
			update: (f) => {
				update(f)
				save(get(o))
			},
			...o,
		}
	})(),
	is_phone$: (() => {
		const _is_phone = () => !window.matchMedia("(min-width:768px)").matches
		const { subscribe, set } = writable(_is_phone())
		addEventListener("resize", () => set(_is_phone()))
		return { subscribe }
	})(),
}
export const { local_settings$, is_phone$ } = store
