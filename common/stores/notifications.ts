import { get, Writable, writable } from "svelte/store"

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
	function addError(n) {
		if (typeof n === "string") n = { value: n }
		if (typeof n === "object") {
			n.type = n.type ?? "error"
			n.millis = n.millis ?? 10000
		}
		add(n)
	}
	return {
		subscribe,
		add,
		addError,
		remove,
	}
})()