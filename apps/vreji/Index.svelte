<script>
	import { Router, Route, Link, navigate } from "@deps/routing";
	import Notifications from "@comps/Notifications.svelte";
    import Status from "./Status.svelte";
    import AuthDetail from "./AuthDetail.svelte";
</script>



<Notifications />
<Router basepath="app">
	<nav class="nav">
		<Link to="./">Dash</Link>
		<Link to="auth">Auth</Link>
		<Link to="chunk">Chunk</Link>
		<Link to="media">Media</Link>
	</nav>

	<Route component={Status}/>
	<Route path="auth" component={AuthDetail}/>
</Router>
<style>
	.nav {
		display: flex;
		justify-content:space-around;
	}
	
</style>