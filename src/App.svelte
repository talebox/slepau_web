<script>
	import Editor from "./pages/Apps.svelte";
	
	import { Router, Route } from "@deps/routing";
	
	import Edit from "./pages/Edit.svelte";
	
</script>

<div class="main">
	<Router>
		<!-- Editor -->
		<Route component={Editor}/>
		<!-- Public Previews -->
		<Route path="/preview/:id" component={Edit} />
		<Route path="/chunk/:id" component={Edit} />
		<Route path="/note/:id" component={Edit} />
	</Router>
</div>

<style>
	.main {
		position: relative;
	}
</style>
