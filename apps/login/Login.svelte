<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import * as s from "./Login.module.scss";
	import Notifications from "@comps/Notifications.svelte";
	import { notifications } from "/common/stores/notifications";
	import { fetchJson } from "@utils/network";
	import cnfc from "@utils/classname";
	const c = cnfc(s);

	let as_admin = false;

	function getValues() {
		let form = document.forms[0];
		if (!form) return;
		return Object.fromEntries(
			new FormData(form).entries()
		);
	}

	function onLogin() {
		fetchJson(`/auth/login`, {
			body: getValues(),
			query: { admin: as_admin },
		}).then(() => {
			location.href = `${globalThis.PREFIX}/app`;
		}, notifications.addError);
	}
	function onReset() {
		fetchJson(`/auth/reset`, { body: getValues() }).then(() => {
			navigate("/login");
			notifications.add("Reset!");
		}, notifications.addError);
	}
	function onRegister() {
		fetchJson(`/auth/register`, { body: getValues() }).then(() => {
			navigate("/login");
			notifications.add("Registered!");
		}, notifications.addError);
	}

	const linkProps = ({ isCurrent }) => ({
		class: c("a", isCurrent && "current"),
	});
</script>

<Notifications />
<Router basepath="/login">
	<form class="container fc">
		<nav class="frw grow-c" style="margin-block: 20px;">
			<Link to="./" replace getProps={linkProps}>Login</Link>
			<Link to="register" replace getProps={linkProps}>Register</Link>
			<Link to="reset" replace getProps={linkProps}>Reset</Link>
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
			<label
				style="display: flex;align-items:center;gap:1em;justify-content:center"
			>
				<input
					style="width:auto"
					type="checkbox"
					bind:checked={as_admin}
				/>
				as admin?
			</label>
			<button type="submit" on:click|preventDefault={onLogin}
				>Login</button
			>
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

<style>
	input {
		width: 100%;
		margin: 0;
	}
	.container {
		max-width: 300px;
		padding: 1em;
		margin: auto;
		gap: 1em;
	}
	.container > * {
		margin: 0;
	}
	.container > button {
		margin-top: 1em;
	}
</style>
