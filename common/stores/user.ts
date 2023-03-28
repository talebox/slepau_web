export let user = fetch("/auth/user")
	.then((r) => { if (r.ok) return r.json(); else throw `Error ${r.status}` })
	.then((claims) => ({ claims, logged_in: claims.user && claims.user !== "public" }))

export let user_assert_logged_in = user.then(u => {
	if (!u.logged_in) {
		throw "User not logged in";
	}
})