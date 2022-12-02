<script>
	import { Router, Route, navigate } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "../comps/Status.svelte";
	import { get_cookie } from "../utils/cookie";
	import Graph from "./Graph.svelte";

	if (!get_cookie("auth")) {
		navigate("/login", { replace: true });
	}
</script>

<Edit />
<Status />
<Drawer />
<Router>
	<Route component={Notes} />
	<Route path="notes" component={Notes} />
	<Route path="well/:?id" component={Well} />
	<Route path="graph/:?id" component={Graph} />
</Router>
