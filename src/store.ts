import { subscribe } from "svelte/internal"
import { readable, Writable, writable } from "svelte/store"
import { fetchE, fetchJson } from './utils/network'
import { debounceG } from "./utils/timout"


export const status = writable<Promise<any> | undefined>(undefined)

export const setStatus = (v: Promise<any>) => {
	status.set(v)
	return v
}

function extend_s(subscribe, onSubscribe, onUnsubscribe) {
	return (...v) => { onSubscribe(); let c = subscribe(...v); return () => { onUnsubscribe(); c() } }
}



interface Chunk {
	id: string,
	value: string,
	owner: string,
	created: number,
	modified: number,
}
interface SocketMessage {
	type?: "Req" | "Res" | "C",
	resource: string,
	value?: string,
}



/**
 * Websockets
 */


type RSub = { resource: string, subscribe, set, listeners: number }
function createDb() {

	let socket_new = () => {

		let socket = new WebSocket(`${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/stream`)
		let messages = [] as string[]
		let subs: { [k: string]: RSub } = {}

		function tick() {
			if (!messages.length) return
			if (socket.readyState === 1 /**Open*/) {
				messages.forEach(m => {
					socket.send(m)
				})
				messages = []
			} else setTimeout(tick, 1000) // Keep waiting for next opportunity
		}

		function send(v: SocketMessage) {
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

			if (change.value) {
				const v = JSON.parse(change.value)
				subs[change.resource]?.set(v)
				// If an update was received on an item of a sub
				let rs = change.resource.split('/')
				if (rs[0] === 'chunks' && rs[1]) {
					{ Object.entries(subs).forEach(([k, v]) => k === ("chunks") && v.listeners && send({ resource: k, type: 'Req' })) }
					{ Object.entries(subs).forEach(([k, v]) => k.startsWith("views/well") && v.listeners && send({ resource: k, type: 'Req' })) }
				}
			} else if (change.type === 'C') {
				// Server is telling us this resource changed, so we request updates on the views that depend on it
				if (change.resource == 'chunks') {
					{ Object.entries(subs).forEach(([k, v]) => k === ("chunks") && v.listeners && send({ resource: k, type: 'Req' })) }
					{ Object.entries(subs).forEach(([k, v]) => k.startsWith("views/well") && v.listeners && send({ resource: k, type: 'Req' })) }
				}
			}
		}
		{
			socket.onopen = (m) => { tick() }
			// socket.onclose = (m) => console.log("Websocket closed",m)
			// socket.onerror = (m) => console.log("Websocket error",m)
			socket.onmessage = (m) => {
				react_to_incoming(m.data)
			}
		}
		return { send, tick, subs }
	}
	let socket = socket_new()



	// This is called by UI when it wants to listen to something
	function subscribeTo(resource: string, init) {

		let sub = socket.subs[resource]
		if (!sub) {
			//@ts-ignore
			sub = { resource, listeners: 0 }
			let { subscribe, ..._rest } = writable(init)
			Object.assign(sub, { subscribe: extend_s(subscribe, () => { if(sub.listeners===0){socket.send({ resource, type: 'Req' })} ++sub.listeners }, () => { --sub.listeners }), ..._rest })

			socket.subs[resource] = sub

			// socket.send({ resource, type: 'Req' })
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
				put: (v) => setStatus(fetchJson("/api/chunks", v, "PUT")),
				new: () => setStatus(fetchJson("/api/chunks", { value: "# New Chunk\n\n" }, "PUT"))
			},
			login: (v) =>
				setStatus(fetchJson("/api/login", v)).then(() => { socket = socket_new() })
			,
			reset: (v) =>
				setStatus(fetchJson("/api/reset", v))
			,
			register: (v) =>
				setStatus(fetchJson("/api/register", v))

		}
	} as const
}

export const db = createDb()

//////////////////

export const editing_id = writable<string | undefined>(undefined)
export const store = {
	// user: (() => {
	// 	const { subscribe, set, update } = writable(localStorage.getItem("preview_show") === 'true')
	// 	return { subscribe, set: (v) => { set(v); localStorage.setItem("preview_show", v), update } }
	// })(),
	wants_preview: (() => {
		const { subscribe, set, update } = writable(localStorage.getItem("preview_show") === 'true')
		return { subscribe, set: (v) => { set(v); localStorage.setItem("preview_show", v), update } }
	})(),
	is_phone: (() => {
		const _is_phone = () => !window.matchMedia("(min-width:768px)").matches
		const { subscribe, set } = writable(_is_phone())
		addEventListener("resize", () => set(_is_phone()))
		return { subscribe }
	})()
}
export const { wants_preview, is_phone } = store