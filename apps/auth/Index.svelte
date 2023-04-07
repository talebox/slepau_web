<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Notifications from "@comps/Notifications.svelte";
	import Sites from "./Sites.svelte";
	import Users from "./Users.svelte";
	import Admins from "./Admins.svelte";
</script>

<Notifications />
<Router basepath={`${globalThis.PREFIX}/app`}>
	<Route component={Sites} />
	<Route path="admins" component={Admins} />
	<Route path="sites/:site_id/users" component={Users} />
</Router>
