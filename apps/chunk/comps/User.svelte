<script>
  import { get } from "svelte/store";
  import { slide } from "svelte/transition";
  import { db } from "../store";
  import UserImg from '@comps/UserImg.svelte';

  let user$ = db.subscribeToUser();
  let user = get(user$);
  $: {
    user = $user$;
  }
</script>

<div class="container">
  <UserImg />

  <table class="content">
    <tr><td>User: </td><td in:slide>{user?.user ?? "<user>"}</td></tr>
    <tr><td>Visible:</td><td in:slide>{user?.notes_visible ?? "<x>"}</td></tr>
    <tr><td>Owned: </td><td in:slide>{user?.notes_owned ?? "<x>"}</td></tr>
    <tr
      ><td>Public: </td><td in:slide>{user?.notes_owned_public ?? "<x>"}</td
      ></tr
    >
  </table>
</div>

<style>
  .container {
    display: flex;
    padding: 8px;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .container td:first-child {
    width: 4.4em;
    text-align: right;
  }
  .content {
    font-size: 0.8em;
    margin: 0;
    flex: 0 1 160px;
  }
  .content td {
    padding: 4px;
  }
  .content tr:not(:last-child) td {
    padding-bottom: 0;
  }
</style>
