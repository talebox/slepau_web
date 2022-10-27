<script>
	import Apps from "./pages/Apps.svelte";
	import Drawer from "~/src/comps/Drawer.svelte";
	import { Router, Route } from "@deps/routing";
	import Login from "./pages/Login.svelte";
	import Status from "./Status.svelte";

	// Remove loading element
	document.getElementById("loading")?.classList.add("close");
	setTimeout(() => {
		document.getElementById("preload")?.remove();
		document.getElementById("loading")?.remove();
	}, 1000);
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
