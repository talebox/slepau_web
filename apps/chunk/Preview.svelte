<script>
	import { Router, Route } from "@deps/routing";
	
	import Preview from "@pages/Preview.svelte";
</script>

<Router>
	<Route>
		<div class="tip">
			Previews need an <b>id</b> <br /> 
			where URL is <code>preview/:id</code>
		</div>
	</Route>
	<Route path="preview/:id" component={Preview} />
</Router>
