import { writable } from "svelte/store"
import { fetchJson } from './utils/network'

const url = "http://localhost:4000"

export const status = writable<Promise<any> | undefined>(undefined)
export const chunks = (() => {
	const endpoint = url + "/chunks"
	const { subscribe, set } = writable<[] | undefined>(undefined)
	const get = () => {
		status.set(fetch(endpoint)
			.then((v) => {
				if (v.ok) return v.json()
			})
			.then((v) => (set(v))))
	}
	return {
		subscribe,
		get,
		put: (chunk) => { status.set(fetchJson(endpoint, chunk, "PUT").then(v => { if (v.ok) get() })) },
		del: (chunks) => { status.set(fetchJson(endpoint, chunks, "DELETE").then(v => { if (v.ok) get() })) }
	}
})()


chunks.get()