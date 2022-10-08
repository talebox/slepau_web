<script>
  import { Router, Link, Route } from "svelte-routing"
  import Drawer from "./comps/Drawer.svelte"
  import Chunks from "./pages/Chunks.svelte"
  let url = ""

  // Remove loading element
  setTimeout(() => {
    document.getElementById("loading")?.classList.add("close")
    setTimeout(() => {
      document.getElementById("preload")?.remove()
      document.getElementById("loading")?.remove()
    }, 1000)
  }, 500)
</script>

<div class="main">
  <Router {url}>
    <Drawer />
    <Route path="/" component={Chunks} />
  </Router>
</div>
