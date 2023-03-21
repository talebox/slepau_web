<script>
  import { db } from "./store"
  import { get } from "svelte/store"
  import Drawer from "@comps/Drawer.svelte"

  let user$ = db.subscribeToUser()
  let user = get(user$)
  $: {
    user = $user$
  }
</script>

<Drawer>
  
</Drawer>

<style>
</style>
