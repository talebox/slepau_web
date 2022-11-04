<script>
  import { Router, Route } from "@deps/routing"
  import Notes from "./Notes.svelte"
  import Edit from "./Edit.svelte"
  import Well from "./Well.svelte"
  import Notifications from "../comps/Notifications.svelte"
</script>

<Notifications />
<Edit />
<Router>
  <Route component={Notes} />
  <Route path="/notes" component={Notes} />
  <Route path="/well/:?id" component={Well} />

  <Route path="/chunk/:id" component={Edit} />
  <Route path="/chunks/:id" component={Edit} />
  <Route path="/note/:id" component={Edit} />
  <Route path="/notes/:id" component={Edit} />
</Router>
