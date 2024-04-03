import { fetchE, fetchJson } from "@utils/network";
import {get, writable} from 'svelte/store';

export const actions = {
	ips: () => fetchE("/ips").then(v => v.json())
		.then((v) => {
			// Order
			const a = Object.entries(v).sort((a, b) => a[1][0] < b[1][0]? 1 : -1);
			return a
		}),
	users: () => fetchE("/by_user").then(v => v.json())
		.then((v) => {
			// Order
			const a = Object.entries(v).sort((a, b) => a[1][0] < b[1][0] ? 1 : -1);
			return a
		}),
	stats_data: (query = {}) => {
		return fetchE(`/stats?${new URLSearchParams(query)}`).then(v => v.json())
			.then(v =>
			({
				labels: new Array(query.limit ?? 24).fill(0).map((v, i) => i + 1),
				datasets: Object.entries(v).map(([k, v]) => ({ name: k, values: v }))
			})
			)
	}
}

export const period = writable(Number(localStorage.getItem("period")) || 3600);
period.subscribe((v) => {
	localStorage.setItem("period", v)
})

const get_limit = () => window.innerWidth < 500 ? 12 : 24;
export const limit = writable(get_limit())
window.addEventListener("resize", () => limit.set(get_limit()));

