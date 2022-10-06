<script>
  import { Router, Link, Route } from "svelte-routing"
  import Home from "./pages/Home.svelte"
  let url = ""
</script>

<div class="main">
  <Router {url}>
    <nav class="p12">
      <Link to="/">Home</Link>
    </nav>
    
    <Route path="/" component={Home}/>
    
  </Router>
</div>

