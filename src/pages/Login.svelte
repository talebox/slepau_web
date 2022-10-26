<script>
	import { db } from "../store";
	import { fetchJson } from "../utils/network";
	import { Router, Route, Link, navigate } from "@deps/routing";

	function getValues() {
		let form = document.forms[0];
		if (!form) return;
		let fd = new FormData(form),
			values = {};
		
		for (const e of fd) {
			if (e[0] && e[1]) values[e[0]] = e[1];
		}
		return Object.values(values);
	}
	function onLogin(e) {
		db.actions.login(getValues()).then(() => navigate("/chunks"));
	}
	function onReset(e) {
		db.actions.reset(getValues());
	}
	function onRegister(e) {
		db.actions.register(getValues());
	}
</script>

<Router>
	<form class="container fc">
		<nav class="frw grow-c" style="margin-block: 20px;">
			<Link to="login"><span class="a">Login</span></Link>
			<Link to="register"><span class="a">Register</span></Link>
			<Link to="reset"><span class="a">Reset</span></Link>
		</nav>
		<Route>
			<label>
				Username
				<input name="user" />
			</label>
			<label>
				Password
				<input type="password" name="pass" />
			</label>
			<button type="submit" on:click|preventDefault={onLogin}>Login</button>
		</Route>
		<Route path="reset">
			<label>
				Username
				<input name="user" />
			</label>
			<label>
				Old Password
				<input type="password" name="old_pass" />
			</label>
			<label>
				New Password
				<input type="password" name="pass" />
			</label>
			<button type="submit" on:click|preventDefault={onReset}
				>Reset Password</button
			>
		</Route>
		<Route path="register">
			<label>
				Username
				<input name="user" />
			</label>
			<label>
				Password
				<input type="password" name="pass" />
			</label>
			<button type="submit" on:click|preventDefault={onRegister}
				>Register</button
			>
		</Route>
	</form>
</Router>

<!-- <form class="container fc" on:submit|preventDefault={onSubmit}>
	<label>
		User
		<input name="user" />
	</label>
	<label>
		Pass
		<input type="password" name="pass" />
	</label>
	<button type="submit">Login</button>
</form> -->
<style>
	.a {
		font-weight: bold;
		display: block;
	}
	.container {
		max-width: 300px;
		padding: 1em;
		margin: auto;
	}
</style>
