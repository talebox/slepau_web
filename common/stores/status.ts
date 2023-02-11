import {  writable } from "svelte/store"
import { debounce } from "../utils/timeout"

export const status = writable<Promise<any> | undefined>(undefined)

export const setStatus = (v: Promise<any>, options?: { timeout?: number, on_resolve?: string, on_reject?: string }) => {
	options = { timeout: 3000, ...options }
	let s = v
	if (options.on_resolve) s = s.then(() => options?.on_resolve)
	if (options.on_reject) s = s.catch(() => options?.on_reject)

	status.set(s)

	// Reset status to green
	debounce(() => status.set(Promise.resolve()), options.timeout, 'status')

	return v
}