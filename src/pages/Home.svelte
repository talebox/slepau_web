<script>
  
  import { Link } from "svelte-routing"
	import {store} from './store'
	
	let userd = store.userd;
	
</script>
<h1>Hello World! :)</h1>
<div class="container">
  <Link to="/quote"></Link>
</div>
