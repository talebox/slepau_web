import { navigate } from '../deps/routing'
import { get, Writable, writable } from "svelte/store"
import { delete_cookie } from "./utils/cookie"
import { fetchE, fetchJson } from "./utils/network"
import { debounce } from "./utils/timout"
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
	value?: string | null
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
			}
		}

		let last_message_id = 1,
			// This saves callbacks to send, so they can later be called if response was successful
			callbacks = {} as {
				[k: number]: [
					((v: any) => any) | undefined,
					((v?: string | null) => any) | undefined
				]
			}
		function send(
			m: SocketMessage,
			onSuccess?: (v?: any, sub?: RSub) => any,
			onError?: (v?: string | null, sub?: RSub) => any
		) {
			if (onSuccess || onError) {
				const id = last_message_id++
				m.id = id
				const sub = m.resource ? subs[m.resource] : undefined
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
				// setTimeout(tick, 1000)
			}
		}
		function maybe_request_update(resource) {
			let view = subs[resource]
			if (view?.listeners) {
				send({ resource })
			}
		}
		function maybe_request_views() {
			Object.entries(subs).forEach(([k, v]) => {
				if (k.startsWith("views")) maybe_request_update(k)
			})
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
			if (m.resource && value && m.type != "Err") {
				// Update the subscription with the new value
				subs[m.resource]?.set(value)

				// If it's a diff for a chunk
				// update the chunk's subscription by applying it
				// So views on everyone change when just sending them diffs
				if (m.resource.endsWith("/diff")) {
					const resource = m.resource.replace(/\/diff$/, "")
					const sub = subs[resource]

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
								let r = applyDiff(v, value)[0]
								return r
							})
						}
					}
				}
			}
			// Execute and remove respective callbacks
			// `id + type + value`
			if (m.id && m.type) {
				switch (m.type) {
					case 'Ok': callbacks[m.id]?.[0]?.(value); break
					case 'Err':
						callbacks[m.id]?.[1]?.(value)
						setStatus(Promise.reject(value))
						break
				}
				delete callbacks[m.id]
			}
			// Resource changes
			if (m.resource && !value) {
				if (m.resource === "chunks") {
					maybe_request_views()
				}
			}
		}
		{
			socket.addEventListener("open", tick)
			socket.addEventListener('message', on_message)
		}

		// Request all subscriptions that have listeners, and aren't diffs
		Object.entries(subs).forEach(
			([k, v]) =>
				v.listeners && v.req_on !== false &&
				send({ resource: v.resource })
		)

		return { send, socket, maybe_request_update, maybe_request_views }
	}
	let connection: ReturnType<typeof connection_new>, timeout, timeout_ms = 10000

	function attach_onopen() {
		timeout = setTimeout(() => {
			//@ts-ignore
			if (process.env.NODE_ENV === "development") {
				console.log(`Connection closed, retrying in '${(timeout_ms / 1000).toFixed(0)} sec'`)
			}
			attach()
		}, timeout_ms)
		timeout_ms = timeout_ms * 1.3
	}
	function attach_onclose() {
		timeout_ms = 10000
	}
	function attach() {

		// Clear last timeout and close connection
		if (connection?.socket) {
			clearTimeout(timeout)
			connection.socket.removeEventListener("close", attach_onopen)
			connection.socket.close()
		}

		// Make new connection
		connection = connection_new()
		connection.socket.addEventListener('open', attach_onclose)
		connection.socket.addEventListener('close', attach_onopen)

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
					connection.send({ resource })
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
	subscribeTo.user = () => {
		return subscribeTo("user", { req_on: "undef" })
	}

	function mediaPost(v) {
		return fetchE("/api/media", { method: "POST", body: v }).then((v) =>
			v.json()
		)
	}
	const logout = () => {
		delete_cookie("auth", { path: "/", domain: undefined, samesite: "Strict" })
		navigate("/login")


		Object.values(subs).forEach(({ reset }) => reset?.())
		subs = {}
		// Reattach socket, so socket with new auth cookie is created
		// Reset subscriptions, so attach doesn't try to fetch things which this user can't see;
		// attach()
		// for (const prop of Object.getOwnPropertyNames(subs)) {
		// 	delete subs[prop];
		// }


		// Notify user of action
		setStatus(Promise.resolve(), { on_resolve: "Logged out!" })
	}

	return {
		_subs: subs,
		get_connection: () => connection,
		subscribeTo,
		actions: {
			chunks: {
				del: (v) => setStatus(fetchJson("/api/chunks", v, "DELETE")),
				put: (id: string, value: string) =>
					connection.send(
						{ resource: `chunks/${id}/value`, value },
						(v, sub) => sub?.update(v => value),
						(v, sub) => sub?.update(v => v)
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
			logout,
			logout_all: () => {
				fetchE("/api/logout_all").then(() => {
					notifications.add("Logged out of all devices!")
					logout()
				})
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

export const store = {
	local_settings$: (() => {
		const _default = {
			wants_preview: false,
			editing_id: undefined,
			zoom: 1,
		}
		function get() {
			try {
				const settings = localStorage.getItem("settings")
				return settings && JSON.parse(settings) || _default
			} catch {
				return _default
			}
		}
		const { set, ...o } = writable(get())
		return {
			set: (v) => {
				if (typeof v == 'object') localStorage.setItem("settings", JSON.stringify(v))
				set(v)
			},
			...o
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
