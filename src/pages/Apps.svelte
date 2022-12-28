<script>
	import { Router, Route, navigate } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "../comps/Status.svelte";
	import { get_cookie } from "../utils/cookie";
	import Graph from "./Graph.svelte";
	import { user$ } from "../store";
	import Search from "../comps/Search.svelte";
	import { get } from "svelte/store";

	let user = get(user$);
	$: {
		user = $user$;
	}

	// Will boot user to login if cookie is false or server said this client is "public"
	$: if (!get_cookie("auth") || user?.user === "public") {
		navigate("/login", { replace: true });
	}
	export let location;
	$: {
		if (["/app", "/app/"].includes(location?.pathname)) {
			setTimeout(() => navigate("/app/well/", { replace: true }), 50);
		}
	}
</script>

<Drawer />

<Edit />
<Status />
<Search />

<Router>
	<Route path="well/:?id" component={Well} />
	<Route path="graph/:?id" component={Graph} />
</Router>
