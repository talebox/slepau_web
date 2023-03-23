export let user = fetch("/auth/user")
	.then((r) => { if (r.ok) return r.json(); else throw `Error ${r.status}` })
	.then((claims) => ({ claims, logged_in: claims.user && claims.user !== "public" }))