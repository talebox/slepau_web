<script>
  import { fade } from "svelte/transition";
  import {user_claims } from "@stores/user";
</script>

<img
    class="photo"
    in:fade
    alt="user"
    style={
      /** Make it obvious this is an admin */
    user_claims.admin ? "outline-color:#ef6c00;outline-width: 2px" : ""}
    src={user_claims?.photo ? `/media/media/${user_claims?.photo}?max=80_2` : ""}
    srcset={user_claims?.photo
      ? `/media/${user_claims?.photo}?max=80x80,
        /media/${user_claims?.photo}?max=160x160 2x,
        /media/${user_claims?.photo}?max=320x320 3x`
      : ""}
  />

<style>
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
