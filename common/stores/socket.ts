/**
 * A WebSocket helper class
 */

import { get, Writable, writable } from "svelte/store"
import { setStatus } from "./status"
import decompress from 'brotli/decompress';

interface SocketMessage {
	id?: number
	resource?: string
	type?: "Ok" | "Err"
	value?: string | null
}

/**
 * Resource Subscriber
 *
 * Ideally views say, I want 'x' resource.
 * Thus DB creates a (Subscriber + Store) with that resource
 * and handles the fetching/updating of the store data.
 */

type Subscription = {
	/**
	 * What resource are we watching?
	 */
	resource: string
	/**
	 * Anyone subscribed to us?
	 */
	listening: boolean
	/**
	 * Used internally to reset all values to their initial value
	 */
	reset: () => void
	/**
	 * When should we automatically request this value?
	 * - `subscription` -> on_subscription always (default)
	 * - `undefined` -> on_subscription **if** value is undefined
	 * - `false` -> never
	 */
	request_on: "undefined" | "subscription" | false
} & Writable<any>


type Subscriptions = Record<string, Subscription>


/**
 * Create a RAM/Browser tiny state.
 *
 * Creates a socket context so views can subscribe to data.
 *
 * Say a view needs 'chunks', we'll send a Req message when WebSocket connection is Open.
 * And we also reconnect on connection Close as well as request the resource again if this is the case.
 */
export class SocketDB {
	url
	timeout
	timeout_ms = 10000
	subs: Subscriptions = {}
	socket: WebSocket
	/**
	 * A message store, in case we try sending messages before a connection is established.
	 *
	 * We need this because a message contains more info than a subscription does.
	 * Because a message can have callbacks, and id's,
	 * and subscriptions really don't care about that.
	 */
	messages = [] as string[]
	callbacks = {} as {
		[k: number]: [
			((v: any) => any) | undefined,
			((v?: string | null) => any) | undefined
		]
	}
	next_id = 1

	constructor(url = "/stream") {
		this.url = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host
			}${url}`;

		// We bind these because when these events are fired by the socket.
		// The functions need to know what object `this` is referring to.
		this.on_open = this.on_open.bind(this)
		this.on_close = this.on_close.bind(this)
		this._on_message = this._on_message.bind(this)
		this.attach()
	}

	/** Socket fires this event when the connection opens */
	on_open() {
		this.timeout_ms = 10000

		Object.entries(this.subs).forEach(([k, v]) => {
			if (v.listening && !!v.request_on) {
				this.send({ resource: v.resource })
			}
		});

		this.tick_messages()
	}
	/** Socket fires this event when the connection closes */
	on_close() {
		this.timeout = setTimeout(() => {
			if (process.env.NODE_ENV === "development") {
				console.log(
					`Connection closed, retrying in '${(this.timeout_ms / 1000).toFixed(
						0
					)} sec'`
				)
			}
			this.attach()
		}, this.timeout_ms)
		this.timeout_ms = this.timeout_ms * 1.3
	}

	/** Clears up last connection/buffers and attemps a new one */
	attach() {
		// Clear last timeout and close connection
		if (this.socket) {
			clearTimeout(this.timeout)
			this.socket.removeEventListener("close", this.on_close)
			this.socket.close()
		}

		if (process.env.NODE_ENV === "development") {
			console.log("Making new connection")
		}
		// Attempt a connection
		this.socket = new WebSocket(this.url)

		// Reset buffers
		this.messages = []
		this.callbacks = {}

		// Add listeners
		this.socket.addEventListener("open", this.on_open)
		this.socket.addEventListener("close", this.on_close)
		this.socket.addEventListener("message", this._on_message)
	}

	tick_messages() {
		if (!this.messages.length) return
		if (this.socket.readyState === 1 /**Open*/) {
			this.messages.forEach(v => this.socket.send(v))
			this.messages = []
		}
	}

	// The function that controls message sending with all THAT^ functionality
	send(
		message: SocketMessage,
		on_ok?: (v?: any, sub?: Subscription) => any,
		on_err?: (v?: string | null, sub?: Subscription) => any
	) {
		// Set message id if a callback was supplied
		if (on_ok || on_err) {
			const id = this.next_id++
			message.id = id
			const sub = message.resource ? this.subs[message.resource] : undefined
			this.callbacks[id] = [(v) => on_ok?.(v, sub), (v) => on_err?.(v, sub)]
		}
		const m_str = JSON.stringify(message)
		if (this.socket.readyState === 1 /**Open*/) {
			this.socket.send(m_str)
		} else {
			this.messages.push(m_str)
		}
	}
	send_promise(message: SocketMessage) {
		return new Promise((resolve, reject) => {
			this.send(message, (v, sub) => resolve([v, sub]), (v, sub) => reject([v, sub]))
		})
	}

	/**
	 * Request update for subscribers with at least 1 listener for a specific resource
	 */
	maybe_request_update(resource) {
		let view = this.subs[resource]
		if (view?.listening) {
			this.send({ resource })
		}
	}
	text_decoder = new TextDecoder();
	async _on_message(event) {
		if (typeof event.data !== 'string') {
			const r = new Uint8Array(await event.data.arrayBuffer());
			const w = decompress(r)
			const text = this.text_decoder.decode(w)
			this.on_message(text)
		} else {
			this.on_message(event.data)
		}
	}
	/**
	 * React to an incoming websocket message
	 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event
	 * @param event WebSocket Message Event
	 */
	on_message(text) {
		let m = JSON.parse(text) as SocketMessage

		if (!['undefined', 'null'].includes(typeof m.value)) {
			// Try parsing as json or abort otherwise
			try {
				m.value = JSON.parse(m.value as string)
			} catch { }
		}

		// Set the value on the subscription
		// `resource + value`
		if (m.resource && m.type != "Err") {
			// Make value {} for all m.values that are undefined. 
			// So we can then easily ask the stores if a new value has come in.
			const v = typeof m.value !== 'undefined' ? m.value : {};
			// Update the subscription with the new value
			this.subs[m.resource]?.set(v)
		}

		// Execute and remove respective callbacks
		// `id + type`
		if (m.id && m.type) {
			switch (m.type) {
				case "Ok":
					this.callbacks[m.id]?.[0]?.(m.value)
					break
				case "Err":
					this.callbacks[m.id]?.[1]?.(m.value)
					setStatus(Promise.reject(m.value))
					break
			}
			delete this.callbacks[m.id]
		}

		return m
	}

	subscribeTo(
		resource: string,
		{
			init_with,
			request_on,
		}: { init_with?; request_on?: "undefined" | "subscription" | false } = {}
	) {
		if (request_on === undefined) request_on = "subscription"
		let sub = this.subs[resource]
		if (!sub) {
			//@ts-ignore
			sub = { resource, listening: 0, request_on }

			let { subscribe, set, update } = writable(init_with, () => {
				// This function gets executed when subscriber count goes from 0 to 1
				if (request_on === "subscription" || (request_on === 'undefined' && get(sub) === undefined)) {
					this.send({ resource })
				}
				sub.listening = true
				return () => {
					sub.listening = false
				}
			})
			Object.assign(sub, {
				subscribe,
				set,
				update,
				reset: () => {
					set(init_with)
				},
			})
			this.subs[resource] = sub
		}

		return {
			subscribe: sub.subscribe,
		}
	}
	subscribeToUser() {
		return this.subscribeTo("user", { request_on: "undefined" })
	}
}
