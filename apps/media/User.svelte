<script>
  import { get } from "svelte/store"
  import { fade, slide } from "svelte/transition"
  import { db } from "../store"

  let user$ = db.subscribeToUser()
  let user = get(user$)
  $: {
    user = $user$
  }
</script>

<div class="container">
  <img
    class="photo"
    in:fade
    alt="user"
    src={user?.photo ? `/media/${user?.photo}` : ""}
  />

  <table class="content">
    <tr><td>User: </td><td in:slide>{globalThis?.user ?? "<user>"}</td></tr>
    <tr
      ><td>Storage: </td><td in:slide
        >{user?.size ?? "<user>"}/{globalThis.user.media_limit
          ? globalThis.user.media_limit / 2 ** 20 + "MB"
          : "♾️"}</td
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
  .photo {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #1375d190;
    outline: 1px solid var(--text-main);
    /* text-align: center; */
    /* padding-block: 1em; */
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
