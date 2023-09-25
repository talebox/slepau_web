<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Notifications from "@comps/Notifications.svelte";
	import Status from "./Status.svelte";
	import Ips from "./Ips.svelte";
	import Details from "./Details.svelte";
	import Users from "./Users.svelte";
	import Stats from "./Stats.svelte";

	function getProps({ isCurrent }) {
		return {
			style: `font-weight:${isCurrent ? "bold" : "initial"}`,
		};
	}
</script>

<Notifications />
<Router basepath="app">
	<nav class="nav">
		<Link {getProps} to="./">Dash</Link>
		<Link {getProps} to="auth">Auth</Link>
		<Link {getProps} to="chunk">Chunk</Link>
		<Link {getProps} to="media">Media</Link>
	</nav>

	<Route component={Status} />
	<Route path="details" component={Details} />
	<Route path="auth">
		<h1 style="text-align: center;">Auth</h1>
		<Stats query={{ key: "auth%" }} />
		<h2>Users</h2>
		<Users />
		<h2>Ips</h2>
		<Ips />
	</Route>
	<Route path="chunk">
		<h1 style="text-align: center;">Chunk</h1>
		<Stats query={{ key: "chunk%" }} />
	</Route>
	<Route path="media">
		<h1 style="text-align: center;">Media</h1>
		<h2>Get</h2>
		<Stats query={{ key: "media_get" }} />
		<h2>Post</h2>
		<Stats query={{ key: "media_post" }} />
	</Route>
</Router>

<style>
	.nav {
		display: flex;
		justify-content: space-around;
	}
</style>
