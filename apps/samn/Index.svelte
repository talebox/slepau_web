<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import NodeDetails from "./NodeDetails.svelte";
	import All from "./All.svelte";
</script>

<Router basepath="app">
	<Route path="node/:id" component={NodeDetails} />
	<Route component={All} />
</Router>
