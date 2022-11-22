<script>
	import { Router, Route, navigate } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "../comps/Status.svelte";
	import Notifications from "../comps/Notifications.svelte";
	import { get_cookie } from "../utils/cookie";

	if (!get_cookie("auth")) {
		navigate("/login", { replace: true });
	}
</script>

<Notifications />
<Edit />
<Status />
<Drawer />
<Router>
	<Route component={Notes} />
	<Route path="notes" component={Notes} />
	<Route path="well/:?id" component={Well} />
</Router>
