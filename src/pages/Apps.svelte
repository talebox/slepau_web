<script>
	import { Router, Link, Route } from "@deps/routing";
	
	import Notes from "./Notes.svelte";
	
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
</script>



<Edit />
<Router>
	<Route component={Notes} />
	<Route path="/chunks" component={Notes} />
	<Route path="/well/:?id" component={Well} />

	<Route path="/chunk/:id" component={Edit} />
	<Route path="/:id" component={Edit} />
</Router>