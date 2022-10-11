<script>
  import { Router, Link, Route } from "svelte-routing"
  import Drawer from "./comps/Drawer.svelte"
  import Chunks from "./pages/Notes.svelte"
  import Status from "./Status.svelte"
  import Edit from "./pages/Edit.svelte"

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

  <Router {url}>
    <Route component={Chunks} />
    <Route path="/chunks/:created" component={Edit} />
  </Router>
</div>

<style>
	.main{
		position: relative;
	}
</style>