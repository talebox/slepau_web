<script>
	import { Router, Route } from "@deps/routing";
	import Preview from "./pages/Preview.svelte";
</script>

<Router>
	<Route>
		<div class="tip">
			Previews need an <b>id</b> <br />with format location at:
			<code>preview/:id</code>
		</div>
	</Route>
	<Route path="preview/:id" component={Preview} />
</Router>
