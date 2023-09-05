<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Notifications from "@comps/Notifications.svelte";
    import Status from "./Status.svelte";
</script>

<Notifications />
<Router>
	<Route component={Status}/>
</Router>
