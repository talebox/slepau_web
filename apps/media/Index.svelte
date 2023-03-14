<script>
  import { Router, Route, Link } from "@deps/routing"

  import Notifications from "@comps/Notifications.svelte"
  import All from "./All.svelte"
  import { actions } from "./store"
  import Details from "./Details.svelte"
  
  

  function dragover(ev) {
    console.log("In drop zone")

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()
  }
  function drop(ev) {
    console.log("Dropped")

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()

    let files = []

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      files = [...ev.dataTransfer.items]
        .filter((v) => v.kind === "file")
        .map((v) => v.getAsFile())
    } else {
      // Use DataTransfer interface to access the file(s)
      files = [...ev.dataTransfer.files]
    }
    actions.media.post_many(files)
  }
</script>


<svelte:body on:drop={drop} on:dragover={dragover} />




<Notifications />

<Router basepath="/app">
  <Route component={All} />
</Router>

<Details />

<style>
</style>
