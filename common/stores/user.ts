
export let user_claims = {};
export let user_promise = fetch("/auth/user")
	.then((r) => r.ok ? r.json() : Promise.reject(`Error ${r.status}`))
	.then((claims) => {
		Object.assign(user_claims, claims);
		return { claims, logged_in: claims.user && claims.user !== "public" }
	})

export let user_assert_logged_in = () => user_promise.then(u => 
	u.logged_in ?
		Promise.resolve(`Hello ${u.claims.user} (ʘ‿ʘ)╯`)
		: Promise.reject("You're not logged in (⊙_⊙')")
)
export let user_assert_admin = () => user_promise.then(u => 
	u.claims.admin ?
		Promise.resolve(`Hello ${u.claims.user} (ʘ‿ʘ)╯`)
		: Promise.reject(`<code>${u.claims.user}</code> is not an <code><b>admin</b></code> (⊙_⊙')`)
)
export let user_assert_super = () =>  user_promise.then(u => 
	u.claims.super ?
		Promise.resolve(`Hello ${u.claims.user} (ʘ‿ʘ)╯`)
		: Promise.reject(`<code>${u.claims.user}</code> is not a <code><b>super</b></code> (⊙_⊙')`)

)
