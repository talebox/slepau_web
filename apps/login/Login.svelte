<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import * as s from "./Login.module.scss";
	import Notifications from "@comps/Notifications.svelte";
	import { notifications } from "/common/stores/notifications";
	import { fetchJson } from "@utils/network";
	import cnfc from "@utils/classname";
	const c = cnfc(s);

	let as_admin = false;
	let form;

	function getValues() {
		if (!form) return;
		let data = Object.fromEntries(new FormData(form).entries());
		console.log(data);
		return data;
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
	<form class="container fc" bind:this={form}>
		<nav class="frw grow-c" style="margin-block: 20px;">
			<Link to="./" replace getProps={linkProps}>Login</Link>
			<Link to="register" replace getProps={linkProps}>Register</Link>
			<Link to="reset" replace getProps={linkProps}>Reset</Link>
		</nav>
		<Route>
			<input name="user" placeholder="Username 🙂" />
			<input type="password" name="pass" placeholder="Password 🔑" />
			<label
				style="display: flex;align-items:center;gap:1em;justify-content:center"
			>
				<input style="width:auto" type="checkbox" bind:checked={as_admin} />
				as admin?
			</label>
			<button type="submit" on:click|preventDefault={onLogin}>Login</button>
		</Route>
		<Route path="reset">
			<input name="user" placeholder="Username 🙂" />
			<input type="password" name="pass_old" placeholder="Old Password 🗝️" />
			<input type="password" name="pass" placeholder="New Password 🔑" />
			<button type="submit" on:click|preventDefault={onReset}
				>Reset Password</button
			>
		</Route>
		<Route path="register">
			<input
				name="user"
				pattern={process.env.REGEX_USERNAME}
				placeholder="Username 🙂"
			/>
			<span class="error-hint">{process.env.REGEX_USERNAME_HUMAN}</span>
			<input
				type="password"
				name="pass"
				pattern={process.env.REGEX_PASSWORD}
				placeholder="Password 🔑"
			/>
			<span class="error-hint">{process.env.REGEX_PASSWORD_HUMAN}</span>
			<input
				type="password"
				on:input={(e) =>
					e.target.setCustomValidity(
						e.target.value != e.target.form.elements["pass"].value
							? "Doesn't match"
							: ""
					)}
				placeholder="Password again 🔐"
			/>
			<span class="error-hint">Doesn't match</span>
			
			<button type="submit" on:click|preventDefault={onRegister}
				>Register</button
			>
		</Route>
	</form>
</Router>

<style>
	input:invalid {
		background: #f008;
	}
	.error-hint {
		color: #f00c;
		display: none;
	}
	input:invalid + .error-hint {
		display: initial;
	}
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
