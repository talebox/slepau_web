<script>
	import Apps from "./pages/Apps.svelte";
	import Drawer from "~/src/comps/Drawer.svelte";
	import { Router, Route } from "@deps/routing";
	import Login from "./pages/Login.svelte";
	import Status from "./Status.svelte";
</script>

<div class="main">
	
		<Router>
			<Route component={Apps} />
			<Route path="login/*" component={Login} />
		</Router>
	
	<Status />

	<Drawer />
</div>

<style>
	.main {
		position: relative;
	}
</style>
