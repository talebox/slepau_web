<script>
	import Apps from "./pages/Apps.svelte";
	import Login from "./pages/Login.svelte";
	import Edit from "./pages/Edit.svelte";
	//import Home from "./pages/Home.svelte";

	import { Router, Route } from "@deps/routing";
	import Notifications from "./comps/Notifications.svelte";
	import Settings from "./pages/Settings.svelte";
	import Test from "./pages/Test.svelte";
	import "./page.scss";
	import Preview from "./pages/Preview.svelte";
</script>

<Notifications />
<div class="main">
	<Router>
		<!-- Editor -->
		<Route>
			<Preview id={"gilib_digis"} />
		</Route>
		<Route path="app/*" component={Apps} />
		<Route path="settings/*" component={Settings} />
		<Route path="test/*" component={Test} />
		<!-- Edit URL -->
		<Route path="edit/:id" component={Edit} />
		<!-- Public Previews -->
		<Route path="preview/:id" component={Preview} />

		<Route path="login/*" component={Login} />
	</Router>
</div>

<style>
	.main {
		position: relative;
	}
</style>
