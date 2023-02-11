

/** Rejects throws if answer is not an ok code */
export const fetchE = (input, _init) => {
	const { query, ...init } = _init
	const _query = typeof query === 'object' ?
		Object.entries(query)
			// Remove all strings that are empty
			.filter(([k, v]) => (typeof v === 'boolean' || v))
			// Map to querystring
			.map(([key, value]) => key + '=' + value).join('&') :
		""

	return fetch(input + (_query ? "?" + _query : ""), init)
		.then(v => Promise.all([Promise.resolve(v), v.ok ? Promise.resolve("") : v.text()]))
		.then(([v, body]) => v.ok ? v : Promise.reject(`${v.status} ${body ? body : v.statusText}`))
}

export const fetchJson = (input, init) =>
	fetchE(input, {
		method: "POST",
		...init,
		body: typeof init.body !== "string" ? JSON.stringify(init.body) : init.body,
		headers: { ...init.headers, "content-type": "application/json" },
	})

