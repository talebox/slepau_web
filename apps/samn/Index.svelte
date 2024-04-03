<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Status from "@comps/Status.svelte";
	import Notifications from "@comps/Notifications.svelte";
	import NodeDetails from "./NodeDetails.svelte";
	import All from "./All.svelte";
</script>

<Status />
<Notifications />
<Router basepath="app">
	<Route path="node/:id" component={NodeDetails} />
	<Route component={All} />
</Router>
