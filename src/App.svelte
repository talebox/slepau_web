<script>
  import { Router, Link, Route  } from "svelte-routing"
  import Drawer from "./comps/Drawer.svelte"
  import Notes from "./pages/Notes.svelte"
  import Status from "./Status.svelte"
  import Edit from "./pages/Edit.svelte"
    // import { basepath } from "./utils/routing"

  let url;

  // Remove loading element
  document.getElementById("loading")?.classList.add("close")
  setTimeout(() => {
    document.getElementById("preload")?.remove()
    document.getElementById("loading")?.remove()
  }, 1000)
	
	
</script>

<div class="main">
  <Drawer />
  <Status />
	<Notes />
	<!-- <Route component={} /> -->
  <Router {url}>
		
		<!-- <Route component={Chunks} /> -->
		
    <Route path="/notes/:created" component={Edit} />
  </Router>
</div>

<style>
	.main{
		position: relative;
	}
</style>