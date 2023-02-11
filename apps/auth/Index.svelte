<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Notifications from "@comps/Notifications.svelte"
	import Sites from "./Sites.svelte";
    import Users from "./Users.svelte";
</script>

<Notifications />
<Router basepath="/app">
	<Route component={Sites} />
	<Route path="sites/:site_id/users" component={Users} />
</Router>
