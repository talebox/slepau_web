import { subscribe } from "svelte/internal"
import { get, readable, Writable, writable } from "svelte/store"
import { delete_cookie } from "./utils/cookie"
import { fetchE, fetchJson } from "./utils/network"
import { debounceGenerator, debounce } from "./utils/timout"
import { applyDiff } from "./utils/utils"

export const notifications = (() => {
	let { subscribe, set, update } = writable<any>({})
	function remove(id) {
		update((v) =>
			Object.fromEntries(Object.entries(v).filter(([k, v]) => k != id))
		)
	}
	function add(n) {
		if (n) {
			if (typeof n === "string") n = { value: n }
			if (typeof n === "object") {
				if (!n.id) n.id = Date.now()
				update((v) => { v[n.id] = n; return v })
				setTimeout(() => remove(n.id), n.millis ?? 3000)
			}
		}
	}
	return {
		subscribe,
		add,
		remove,
	}
})()
export const status = writable<Promise<any> | undefined>(undefined)

export const setStatus = (v: Promise<any>) => {
	status.set(v)
	return v
}

interface SocketMessage {
	id?: number
	resource: string
	type?: "Req" | "Ok" | "Err" | "C"
	value?: string
}

/**
 * Websockets
 */

type RSub = {
	resource: string
	listeners: number
	reset: () => void
} & Writable<any>
function createDb() {
	let subs: { [k: string]: RSub } = {}

	let connection_new = () => {
		console.log("Making new connection")
		let socket = new WebSocket(
			`${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host
			}/api/stream`
		)
		let messages = [] as string[]

		function tick() {
			if (!messages.length) return
			if (socket.readyState === 1 /**Open*/) {
				messages.forEach((m) => {
					socket.send(m)
				})
				messages = []
			} else setTimeout(tick, 1000) // Keep waiting for next opportunity
		}

		let last_message_id = 1,
			// This saves callbacks to send, so they can later be called if response was successful
			send_callbacks = {} as {
				[k: number]: [
					((v: any, sub?: RSub) => any) | undefined,
					((v?: string, sub?: RSub) => any) | undefined
				]
			}
		function send(
			v: SocketMessage,
			onSuccess?: (v: any, sub?: RSub) => any,
			onError?: (v?: string, sub?: RSub) => any
		) {
			if (onSuccess || onError) {
				let id = last_message_id++
				v.id = id
				send_callbacks[id] = [onSuccess, onError]
			}
			let m = JSON.stringify(v)
			if (socket.readyState === 1 /**Open*/) {
				socket.send(m)
			} else {
				messages.push(m)
				setTimeout(tick, 1000)
			}
		}
		// Handles reactions to incoming messages

		function react_to_incoming(m) {
			let change = JSON.parse(m) as SocketMessage
			let change_value = change.value
			if (change_value) {
				try {
					change_value = JSON.parse(change_value)
				} catch { }
			}

			if (["C", "Ok"].includes(change.type || "")) {
				// Set value on subscription
				if (change_value) {
					subs[change.resource]?.set(change_value)
				}

				// Handle callback
				if (change.type === "Ok" && change.id) {
					send_callbacks[change.id]?.[0]?.(change_value, subs[change.resource])
					delete send_callbacks[change.id]
				}
			}
			if (change.type === "C") {
				// Server is telling us this resource changed, so we request updates on the views that depend on it
				function maybe_request_update(resource) {
					let view = subs[resource]
					if (view?.listeners) {
						send({ resource, type: "Req" })
					}
				}
				if (change.resource == "chunks") {
					maybe_request_update("chunks")
					Object.entries(subs).forEach(([k, v]) => {
						if (k.startsWith("views/well")) maybe_request_update(k)
					})
				}
				if (change.resource.endsWith("/diff")) {
					let resource = change.resource.replace(/\/diff$/, "")
					let sub = subs[resource]
					if (resource.startsWith("chunks/")) {
						sub?.update((v) => {
							if (!v) {
								// If v is null, another user gave us access
								// but we can't apply diff because we don't have base value yet.
								// Try requesting a value if anyone is listening.
								maybe_request_update(resource)
								return v
							}
							let r = applyDiff(v.value, change_value)[0]
							return { ...v, value: r, no_edit: true }
						})
					}
				}
			}
			if (change.type === "Err") {
				// Handle callback
				if (change.id) {
					send_callbacks[change.id]?.[1]?.(change.value, subs[change.resource])
					delete send_callbacks[change.id]
				}

				status.set(Promise.reject(change.value))
				debounce(() => status.set(Promise.resolve()), 3000, 'status')
			}
		}
		{
			socket.onopen = (m) => {
				tick()
			}
			socket.onmessage = (m) => {
				react_to_incoming(m.data)
			}
		}

		// Request all subscriptions that have listeners, and aren't diffs
		Object.entries(subs).forEach(
			([k, v]) => 
			v.listeners && 
			!v.resource.endsWith('/diff') && 
			send({ resource: v.resource, type: "Req" })
		)

		return { send, socket }
	}
	let connection, timeout
	function attach() {
		// Clear last timeout and close connection
		if (connection?.socket) {
			clearTimeout(timeout)
			connection.socket.onclose = undefined
			connection.socket.close()
		}

		// Make new connection
		connection = connection_new()
		connection.socket.onclose = () => {
			timeout = setTimeout(() => {
				console.log("Connection closed, retrying in 10secs")
				attach()
			}, 10000)
		}
	}
	attach()

	// This is called by UI when it wants to listen to something
	function subscribeTo(resource: string, init, req_on_sub = true) {
		let sub = subs[resource]
		if (!sub) {
			//@ts-ignore
			sub = { resource, listeners: 0 }
			let { subscribe, set, update } = writable(init, (s) => {
				if (sub.listeners === 0 && req_on_sub) {
					connection.send({ resource, type: "Req" })
				}
				++sub.listeners
				return () => {
					--sub.listeners
				}
			})
			Object.assign(sub, {
				subscribe,
				set,
				update,
				reset: () => {
					set(init)
				},
			})

			subs[resource] = sub
		}

		return {
			subscribe: sub.subscribe,
		}
	}

	return {
		// subscribe,
		subscribeTo,
		actions: {
			chunks: {
				del: (v) => setStatus(fetchJson("/api/chunks", v, "DELETE")),
				put: (id: string, value: string) =>
					connection.send(
						{ resource: `chunks/${id}`, type: "C", value },
						(v, sub) => {
							sub?.update((v) => ({ ...v, value, no_edit: true }))
						},
						(v, sub) => {
							sub?.update((v) => ({ ...v, no_edit: false }))
						}
					),
				new: (value?) =>
					setStatus(
						fetchJson(
							"/api/chunks",
							{ value: value ?? "# New Chunk\n\n" },
							"PUT"
						)
					),
			},
			login: (v) =>
				setStatus(fetchJson("/api/login", v)).then(() => {
					// Reset subscriptions, so local view cache is cleared, hopefully views make new subs and let go of the old ones
					// subs = {}
					// On second thought, let's not do this, simply reset the values
					Object.values(subs).forEach(({ reset }) => reset())

					// Reattach socket, so socket with new auth cookie is created
					attach()
					// // Query user so
					// fetchE("/api/user").then((v) => v.json()).then((v) => subs['user']?.set(v))
				}),
			logout: () => {
				//@ts-ignore
				delete_cookie("auth", { path: "/", samesite: "Strict" })

				Object.values(subs).forEach(({ reset }) => reset())
				// Reattach socket, so socket with new auth cookie is created
				attach()
			},
			reset: (v) => setStatus(fetchJson("/api/reset", v)),
			register: (v) => setStatus(fetchJson("/api/register", v)),
		},
	} as const
}

export const db = createDb()

export const editing_id = writable<string | undefined>(undefined)
export const store = {
	wants_preview: (() => {
		const { subscribe, set, update } = writable(
			localStorage.getItem("preview_show") === "true"
		)
		return {
			subscribe,
			set: (v) => {
				set(v)
				localStorage.setItem("preview_show", v), update
			},
		}
	})(),
	is_phone: (() => {
		const _is_phone = () => !window.matchMedia("(min-width:768px)").matches
		const { subscribe, set } = writable(_is_phone())
		addEventListener("resize", () => set(_is_phone()))
		return { subscribe }
	})(),
}
export const { wants_preview, is_phone } = store
