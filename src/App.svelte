<script>
	import Editor from "./pages/Apps.svelte";
	import Login from "./pages/Login.svelte";
	import Edit from "./pages/Edit.svelte";
	import Home from "./pages/Home.svelte";

	import { Router, Route } from "@deps/routing";
	import Notifications from "./comps/Notifications.svelte";
	import Settings from "./pages/Settings.svelte";
	import Test from "./pages/Test.svelte";
	import "./page.scss";
</script>

<Notifications />
<div class="main">
	<Router>
		<!-- Editor -->
		<Route path="" component={Home} />
		<Route path="app/*" component={Editor} />
		<Route path="settings/*" component={Settings} />
		<Route path="test/*" component={Test} />
		<Route path="edit/:id" component={Edit} />
		<!-- Public Previews -->
		<Route path="preview/:id" component={Edit} />
		<Route path="chunk/:id" component={Edit} />
		<Route path="note/:id" component={Edit} />
		<!-- Temporary, server will answer this request soon -->
		<Route path="page/:id" component={Edit} />

		<Route path="login/*" component={Login} />
	</Router>
</div>

<style>
	.main {
		position: relative;
	}
</style>
