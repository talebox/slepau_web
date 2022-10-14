import { Writable, Readable, writable, Updater } from "svelte/store"
import { fetchJson } from './utils/network'
import { debounceG } from "./utils/timout"


export const status = writable<Promise<any> | undefined>(undefined)

const setStatus = (v: Promise<any>) => {
	status.set(v)
	return v
}

interface Chunk {
	_id: string,
	value: string,
	created: number,
	modified: number,
}

// I just have events

const createResource = <T>(endpoint, key_name, update_time = 2000) => {
	const { subscribe, ...resource } = writable<{ [key: string]: [T, Writable<T>] }>()
	// const changes = writable<object>()
	// const data = []

	const upstreamDelay = debounceG()

	const item_to_store = (i: T) => {
		const { subscribe, set: _set } = writable(i)
		const rv = [i, {
			subscribe,
			set: (v: T, callback: any) => {
				// console.log("Set ", v)
				rv[0] = v
				_set(rv[0]); _put(rv[0], callback)
			},
			update: (v: Updater<T>, callback: any) => {
				// console.log("Update ", v)
				rv[0] = v(rv[0])
				_set(rv[0]); _put(rv[0], callback)
			},
		}] as [T, Writable<T>]
		return [i[key_name], rv]
	}

	const get = () => setStatus(fetch(endpoint)
		.then((v) => { return v.json() })
		.then((items: T[]) => {
			if (!Array.isArray(items)) throw "Resource has to be an array"
			resource.set(Object.fromEntries(items.map(item_to_store)))
		}))


	const __put = (item) => setStatus(fetchJson(endpoint, item, "PUT"))
	const _put = (item: T, callback) => upstreamDelay(() => __put(item).then(callback), update_time, item[key_name])

	const put = (item: T) => __put(item).then(r => r.json()).then((item) =>
		// Add new object to store
		resource.update((v) => Object.assign(v, Object.fromEntries([item_to_store(item)])))
	)
	const del = (items: T[]) =>
		setStatus(
			fetchJson(endpoint, items, "DELETE")
				.then(() =>
					resource.update(v => {
						items.forEach((i) => delete v[i[key_name]])
						return v
					})))

	return {
		/**
		 * Triggers on data object changes
		 */
		subscribe,
		/**
		 * Add new item to resource list,
		 * Should not be modifying items with this, but it is possible
		 */
		put,
		/**
		 * Fetching everything
		 */
		get,
		/**
		 * Deleting multiple items
		 */
		del,

	}
}

export const store = {
	chunks: createResource<Chunk>("/chunks", 'created'),
	preview_show: (() => {
		const { subscribe, set,update } = writable(localStorage.getItem("preview_show") === 'true')
		return { subscribe, set: (v) => { set(v); localStorage.setItem("preview_show", v),update } }
	})(),
	is_phone: (() => {
		const _is_phone = () => !window.matchMedia("(min-width:768px)").matches;
		const { subscribe, set } = writable(_is_phone())
		addEventListener("resize", () => set(_is_phone()))
		return { subscribe }
	})()
}
export const { chunks, preview_show, is_phone } = store

chunks.get()