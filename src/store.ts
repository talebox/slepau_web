import { subscribe } from "svelte/internal"
import { navigate } from '../deps/routing'
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

export const setStatus = (v: Promise<any>, options?: { timeout?: number, on_resolve?: string, on_reject?: string }) => {
	options = { ...{ timeout: 3000 }, ...options }
	let s = v
	if (options.on_resolve) s = s.then(() => options?.on_resolve)
	if (options.on_reject) s = s.catch(() => options?.on_reject)

	status.set(s)

	// Reset status to green
	debounce(() => status.set(Promise.resolve()), options.timeout, 'status')

	return v
}

interface SocketMessage {
	id?: number
	resource?: string
	type?: "Ok" | "Err"
	value?: string  | null
}

/**
 * Websockets
 */

type RSub = {
	resource: string
	listeners: number
	reset: () => void
	req_on: string | false,
} & Writable<any>
function createDb() {
	let subs: { [k: string]: RSub } = {}

	let connection_new = () => {
		//@ts-ignore
		if (process.env.NODE_ENV === "development") {
			console.log("Making new connection")
		}
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
			callbacks = {} as {
				[k: number]: [
					((v: any) => any) | undefined,
					((v?: string|null) => any) | undefined
				]
			}
		function send(
			m: SocketMessage,
			onSuccess?: (v?: any, sub?: RSub) => any,
			onError?: (v?: string|null, sub?: RSub) => any
		) {
			if (onSuccess || onError) {
				const id = last_message_id++
				m.id = id
				const sub = m.resource ? subs[m.resource] : undefined;
				callbacks[id] = [
					(v) => onSuccess?.(v, sub), 
					(v) => onError?.(v, sub)
				]
			}
			const m_str = JSON.stringify(m)
			if (socket.readyState === 1 /**Open*/) {
				socket.send(m_str)
			} else {
				messages.push(m_str)
				setTimeout(tick, 1000)
			}
		}
		function maybe_request_update(resource) {
			let view = subs[resource]
			if (view?.listeners) {
				send({ resource})
			}
		}
		/**
		 * React to an incoming websocket message
		 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event
		 * @param event WebSocket Message Event
		 */
		function on_message(event) {
			let m = JSON.parse(event.data) as SocketMessage
			let value = m.value
			if (value) {
				// Try parsing as json or abort otherwise
				try {
					value = JSON.parse(value)
				} catch { }
			}

			// Default to setting the value on the subscription
			// `resource + value`
			if (m.resource && m.value) {
				// Update the subscription with the new value
				subs[m.resource]?.set(value)
				
				// If it's a diff for a chunk
				// update the chunk's subscription by applying it
				// So views on everyone change when just sending them diffs
				if (m.resource.endsWith("/diff")) {
					let resource = m.resource.replace(/\/diff$/, "")
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
							let r = applyDiff(v.value, value)[0]
							return { ...v, value: r, no_edit: true }
						})
					}
				}
			}
			// Execute and remove respective callbacks
			// `id + type + value`
			if (m.id && m.type) {
				switch (m.type) {
					case 'Ok':callbacks[m.id]?.[0]?.(value);break;
					case 'Err':callbacks[m.id]?.[1]?.(value);break;
				}
				delete callbacks[m.id]
			}

			// Resource changes
			if (m.resource && !m.value) {
				
				if (m.resource == "chunks") {
					maybe_request_update("chunks")
					Object.entries(subs).forEach(([k, v]) => {
						if (k.startsWith("views/well") || k.startsWith("views/graph")) maybe_request_update(k)
					})
				}
			}
			
		}
		{
			socket.onopen = tick
			socket.onmessage = on_message
		}

		// Request all subscriptions that have listeners, and aren't diffs
		Object.entries(subs).forEach(
			([k, v]) =>
				v.listeners && v.req_on !== false &&
				send({ resource: v.resource })
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
				//@ts-ignore
				if (process.env.NODE_ENV === "development") {
					console.log("Connection closed, retrying in 10secs")
				}
				attach()
			}, 10000)
		}
	}
	attach()

	// This is called by UI when it wants to listen to something
	function subscribeTo(resource: string, { init, req_on }: { init?, req_on?: "undef" | "sub" | false } = {}) {
		if (req_on === undefined) req_on = "sub"
		let sub = subs[resource]
		if (!sub) {
			//@ts-ignore
			sub = { resource, listeners: 0, req_on }
			let { subscribe, set, update } = writable(init, (s) => {
				if (req_on === "undef" ? (get(sub) === init) : req_on === "sub") {
					connection.send({ resource})
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

	function mediaPost(v) {
		return fetchE("/api/media", { method: "POST", body: v }).then((v) =>
			v.json()
		)
	}

	return {
		// subscribe,
		subscribeTo,
		actions: {
			chunks: {
				del: (v) => setStatus(fetchJson("/api/chunks", v, "DELETE")),
				put: (id: string, value: string) => 
					connection.send(
						{ resource: `chunks/${id}`, value },
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
				setStatus(fetchJson("/api/login", v), { on_resolve: "Logged in!" }).then(() => {
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
				navigate("/login")

				setTimeout(() => {
					Object.values(subs).forEach(({ reset }) => reset())
					// Reattach socket, so socket with new auth cookie is created
					subs = {} // Reset subscriptions, so attach doesn't try to fetch things which this user can't see;
					attach()

					// Notify user of action
					setStatus(Promise.resolve(), { on_resolve: "Logged out!" })
				}, 30)
			},
			media: {
				post: (v) => setStatus(
					mediaPost(v),
					{
						timeout: 40000,
						on_resolve: "Upload success!",
					}
				),
				post_many: (va: any[]) => setStatus(
					Promise.all(va.map((v) => mediaPost(v))),
					{
						timeout: 40000,
						on_resolve: "Upload success!",
					}
				)
			},
			reset: (v) => setStatus(fetchJson("/api/reset", v), { on_resolve: "Password reset!" }),
			register: (v) => setStatus(fetchJson("/api/register", v), { on_resolve: "User registered!" }),
		},
	} as const
}

export const db = createDb()

export const user = db.subscribeTo("user", {req_on:"undef"})
export const editing_id = writable<string | undefined>(undefined)
export const zoom = (() => {
	const { subscribe, set, update } = writable<number>(Number(localStorage.getItem("zoom") ?? 1) || 1)
	return {
		subscribe,
		set: (v) => {
			set(v)
			localStorage.setItem("zoom", v)
		},
	}
})()
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
