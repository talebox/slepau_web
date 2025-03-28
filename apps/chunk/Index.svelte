<script>
	import { Router, Route } from "@deps/routing";

	import Apps from "./pages/Apps.svelte";
	import Login from "./pages/Login.svelte";
	import Edit from "./pages/Edit.svelte";
	import Settings from "./pages/Settings.svelte";
	import Preview from "./pages/Preview.svelte";
	import Notifications from "@comps/Notifications.svelte";
</script>

<Notifications />
<div class="main">
	<Router basepath={`${globalThis.PREFIX}/app`}>
		<Route component={Apps} />
		<Route path="settings/*" component={Settings} />
		
		<!-- Edit URL -->
		<Route path="edit/:id" component={Edit} />
		<!-- Public Previews -->
		<!-- <Route path="preview/:id" component={Preview} /> -->
	</Router>
</div>

<style>
	.main {
		position: relative;
	}
</style>
