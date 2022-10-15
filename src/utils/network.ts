/** Rejects throws if answer is not an ok code */
export const fetchE = (input: RequestInfo | URL, init?: RequestInit | undefined) =>
	fetch(input, init)
		.then(v => { if (!v.ok) throw `${v.status} ${v.statusText}`; return v })

export function fetchJson(endpoint, body, method) {
	return fetchE(endpoint, {
		method,
		body: JSON.stringify(body),
		headers: { "Content-type": "application/json" },
	})
}