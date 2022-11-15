<script>
	import { Router, Route } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Login from "./Login.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "../comps/Status.svelte";
	import Notifications from "../comps/Notifications.svelte";
</script>

<Notifications />
<Edit />
<Status />
<Drawer />
<Router>
	<Route component={Notes} />
	<Route path="notes" component={Notes} />
	<Route path="well/:?id" component={Well} />
	<Route path="login/*" component={Login} />
</Router>
