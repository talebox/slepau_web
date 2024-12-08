<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Status from "@comps/Status.svelte";
	import Notifications from "@comps/Notifications.svelte";
	import NodeDetails from "./NodeDetails.svelte";
	import All from "./All.svelte";
	import notifications from "@stores/notifications";
	import { db } from "./store";
    import Schedule from "./Schedule.svelte";

	function getProps({ isCurrent }) {
		return {
			style: `font-weight:${isCurrent ? "bold" : "initial"}`,
		};
	}

	const commands$ = db.subscribeTo("commands", { init_with: [] });
	$: commands = $commands$;
	let not_id;
	$: {
		if (commands.length) {
			not_id = notifications.add({
				value: `${commands.length} ${commands.length > 1 ? "commands" : "command"} queued.`,
				id: not_id,
				timeout: commands.length ? 120 * 1000 : 1000,
			});
		} else {
			notifications.remove(not_id);
		}
	}
</script>

<Status />
<Notifications />
<Router basepath="app">
	<nav class="nav">
		<Link {getProps} to="./">Dash</Link>
		<Link {getProps} to="schedule">Schedule</Link>
	</nav>

	<Route path="node/:id" component={NodeDetails} />
	<Route path="schedule" component={Schedule} />
	<Route component={All} />
</Router>

<style>
	.nav {
		display: flex;
		justify-content: space-around;
		margin-bottom: 24px;
	}
</style>