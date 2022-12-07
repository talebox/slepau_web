<script>
	import { Router, Route, navigate } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "../comps/Status.svelte";
	import { get_cookie } from "../utils/cookie";
	import Graph from "./Graph.svelte";
	import { user } from "../store";
	
	// Will boot user to login if cookie is false or server said this client is "public"
	$: if (!get_cookie("auth") || $user?.user === "public") {
		navigate("/login", { replace: true });
	}
</script>

<Drawer />

<Edit />
<Status />

<Router>
	<Route component={Notes} />
	<Route path="notes" component={Notes} />
	<Route path="well/:?id" component={Well} />
	<Route path="graph/:?id" component={Graph} />
</Router>
