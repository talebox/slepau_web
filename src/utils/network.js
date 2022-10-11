export function fetchJson (endpoint, body, method) {
	return fetch(endpoint, {
		method,
		body:JSON.stringify(body),
		headers: { "Content-type": "application/json" },
	})
}