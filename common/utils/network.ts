/** Rejects throws if answer is not an ok code */
export const fetchE = (input: RequestInfo | URL, init?: RequestInit | undefined) =>
	fetch(input, init)
		.then(v => Promise.all([Promise.resolve(v), v.ok ? Promise.resolve("") : v.text()]))
		.then(([v, body]) => v.ok ? v : Promise.reject(`${v.status} ${body ? body : v.statusText}`))

export const fetchJson = (endpoint, body, method="POST") =>
	fetchE(endpoint, {
		method,
		body: JSON.stringify(body),
		headers: { "Content-type": "application/json" },
	})
