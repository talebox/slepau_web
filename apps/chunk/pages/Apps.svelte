<script>
	import { Router, Route, navigate } from "@deps/routing";
	import Notes from "./Notes.svelte";
	import Edit from "./Edit.svelte";
	import Well from "./Well.svelte";
	import Drawer from "../comps/Drawer.svelte";
	import Status from "@comps/Status.svelte";
	import Graph from "./Graph.svelte";
	import { db } from "../store";
	import Search from "@comps/Search.svelte";
	import { get } from "svelte/store";
	import Calendar from "./Calendar.svelte";
	import Alarms from "./Alarms.svelte";
	import Clock from "./Clock.svelte";
    import Table from "../comps/Table.svelte";

	let user$ = db.subscribeToUser();
	let user = get(user$);
	$: {
		user = $user$;
	}

	// Will boot user to login if cookie is false or server said this client is "public"
	// $: if (user?.user === "public") {
	// 	navigate("/login", { replace: true });
	// }
	export let location;
	$: {
		if (
			[`${globalThis.PREFIX}/app`, `${globalThis.PREFIX}/app/`].includes(
				location?.pathname
			)
		) {
			setTimeout(
				() => navigate(`${globalThis.PREFIX}/app/well/`, { replace: true }),
				50
			);
		}
	}
</script>

<Drawer />

<Edit />
<Status />
<!-- <Search /> -->

<Router>
	<Route path="calendar" component={Calendar} />
	<Route path="alarms" component={Alarms} />
	<Route path="clock" component={Clock} />
	<Route path="table" component={Table} />

	<Route path="well/:?id" component={Well} />
	<Route path="graph/:?id" component={Graph} />
</Router>
