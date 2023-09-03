<script>
	import { Router, Route } from "@deps/routing";
	import Emojis from '@comps/Emojis.svelte';
	import Notifications from "@comps/Notifications.svelte";
	
</script>

<Notifications />
<Router basepath="emojis">
	<Route component={Emojis}/>
</Router>
