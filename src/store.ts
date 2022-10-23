import { writable } from "svelte/store"
import { fetchE, fetchJson } from './utils/network'
import { debounceG } from "./utils/timout"


export const status = writable<Promise<any> | undefined>(undefined)

const setStatus = (v: Promise<any>) => {
	status.set(v)
	return v
}

interface Chunk {
	id: string,
	value: string,
	owner: string,
	created: number,
	modified: number,
}

// I just have events

const createResource = <T>(endpoint) => {
	const { subscribe, ...resource } = writable<T[]>([])

	const upstreamDelay = debounceG()

	const get = () => setStatus(fetchE(endpoint)
		.then((v) => { return v.json() })
		.then((items: T[]) => {
			if (!Array.isArray(items)) throw "Resource has to be an array"
			resource.set(items)
		}))


	return {
		/**
		 * Triggers on data object changes
		 */
		subscribe,
		/**
		 * Add new item to resource list,
		 * If you're just modifying an item, this is inneficient. 
		 * Use the item's store specifically
		 */
		// put: (item:T, callback) => put_debounce(item, v=>{get(); callback(v);}),
		put: (item: T) => setStatus(fetchJson(endpoint, item, "PUT")).then(get),
		// new: (item: T) => put(item).then(get),
		/**
		 * Fetching everything
		 */
		get,
		/**
		 * Deleting multiple items
		 */
		del: (items: T[]) => setStatus(fetchJson(endpoint, items, "DELETE")).then(get),

	}
}

// const createResource = (endpoint, key_name, update_time = 2000) => 

export const store = {
	chunks: createResource<[Chunk, string]>("/chunks"),
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
export const { chunks, wants_preview, is_phone } = store

chunks.get()