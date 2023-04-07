import { SocketDB } from "../../common/stores/socket"
import { setStatus } from "../../common/stores/status"
import { fetchE } from "@utils/network"
import { writable } from "svelte/store"
import notifications from "../../common/stores/notifications"
import { batch_upload } from "../../common/utils/utils"
import { fetchJson } from "../../common/utils/network"

export const editing_id$ = writable()

class MediaDB extends SocketDB {
	constructor() {
		super("/media/stream")
	}
	on_open() {
		super.on_open()

		Object.entries(this.subs).forEach(
			([k, v]) =>
				v.listening &&
				v.request_on !== false &&
				this.send({ resource: v.resource })
		)
	}
	/**
	 * Request update for view subscribers with at least 1 listener
	 */
	maybe_request_views() {
		Object.entries(this.subs).forEach(([k, v]) => {
			if (k.startsWith("views")) this.maybe_request_update(k)
		})
	}
	on_message(event) {
		let m = super.on_message(event)

		// Resource changes
		if (m.resource && typeof m.value === "undefined") {
			if (m.resource === "media") {
				this.maybe_request_views()
			} else if (m.resource.startsWith("media")) {
				this.maybe_request_update(m.resource)
			}
		}

		return m
	}
}

export const db = new MediaDB()

function mediaDelete(id) {
	return fetchE(`/media/media/${id}`, { method: "DELETE" }).then((v) => v.json())
}

let notification_id

const query_to_uri = (query) =>
	typeof query === "object"
		? (Object.entries(query).length ? "?" : "") +
		Object.entries(query)
			.filter(([k, v]) => k && v)
			.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
			.join("&")
		: query

export const query_from_uri = (query) =>
	typeof query === "string"
		? Object.fromEntries(
			query
				.replace(/^\?/, "")
				.split("&")
				.map((v) => {
					v = v.split("=")
					return [decodeURIComponent(v[0]), decodeURIComponent(v[1])]
				})
				.filter(([k, v]) => k && v)
		)
		: query

export const make_query = (query) => {
	query = query_from_uri(query ?? "")
	// console.log(query)
	// query = { ...base_query, ...query }
	return query_to_uri(query)
}

export const actions = {
	media: {
		post: (v) =>
			setStatus(
				fetchE("/media/media", { method: "POST", body: v }).then((v) => v.json()),
				{
					timeout: 40000,
					on_resolve: "Upload success!",
				}
			),
		post_many: (v_array) =>
			setStatus(batch_upload(
				v_array,
				(v) =>
					fetchE("/media/media", { method: "POST", body: v })
						.then((v) => v.json())
						.catch((err) => setStatus(Promise.reject(err.toString()))),
				({ result, done, left }) => {
					let value = `Uploaded ${done} of ${done + left}.`
					notification_id = notifications.add({
						id: notification_id,
						value,
						timeout: 0,
					})
				},
				(results) => {
					notifications.add({
						id: notification_id,
						timeout: 10000,
						value: `Uploaded ${results.length} items successfully!`,
					})
					notification_id = undefined
					db.maybe_request_views()
				}
			)),
		patch: ({ id, ...v }) => {
			fetchJson(`/media/media/${id}`, { method: "PATCH", body: v }).then((v) =>
				v.json()
			)
		},
		remove_many: (v_array) =>
			batch_upload(
				v_array,
				mediaDelete,
				({ result, done, left }) => {
					let value = `Removed ${done} of ${done + left}.`
					notification_id = notifications.add({
						id: notification_id,
						value,
						timeout: 0,
					})
				},
				(results) => {
					notifications.add({
						id: notification_id,
						timeout: 10000,
						value: `Removed ${results.length} items successfully!`,
					})
					notification_id = undefined
					db.maybe_request_views()
				}
			),
	},
}
