<script>
  import { db } from "../store"
  import { fetchJson } from "../utils/network"
	import Status from "../comps/Status.svelte";
  import { Router, Route, Link, navigate } from "@deps/routing"
  import * as s from "./Login.module.scss"
  import cnfc from "../utils/classname"
  const c = cnfc(s)

  function getValues() {
    let form = document.forms[0]
    if (!form) return
    let fd = new FormData(form),
      values = {}

    for (const e of fd) {
      if (e[0] && e[1]) values[e[0]] = e[1]
    }
    return Object.values(values)
  }
  function onLogin(e) {
    db.actions.login(getValues()).then(() => navigate("/app"))
  }
  function onReset(e) {
    db.actions.reset(getValues()).then(() => navigate("/login"))
  }
  function onRegister(e) {
    db.actions.register(getValues()).then(() => navigate("/login"))
  }

  const linkProps = ({ isCurrent }) => ({
    class: c("a", isCurrent && "current"),
  })
</script>

<Status />
<Router>
  <form class="container fc">
    <nav class="frw grow-c" style="margin-block: 20px;">
      <Link to="./" replace getProps={linkProps}>Login</Link>
      <Link to="register" replace getProps={linkProps}>Register</Link>
      <Link to="reset" replace getProps={linkProps}>Reset</Link>
    </nav>
    <Route>
      <label>
        Username
        <input name="user" />
      </label>
      <label>
        Password
        <input type="password" name="pass" />
      </label>
      <button type="submit" on:click|preventDefault={onLogin}>Login</button>
    </Route>
    <Route path="reset">
      <label>
        Username
        <input name="user" />
      </label>
      <label>
        Old Password
        <input type="password" name="old_pass" />
      </label>
      <label>
        New Password
        <input type="password" name="pass" />
      </label>
      <button type="submit" on:click|preventDefault={onReset}
        >Reset Password</button
      >
    </Route>
    <Route path="register">
      <label>
        Username
        <input name="user" />
      </label>
      <label>
        Password
        <input type="password" name="pass" />
      </label>
      <button type="submit" on:click|preventDefault={onRegister}
        >Register</button
      >
    </Route>
  </form>
</Router>

<style>
  input {
    width: 100%;
    margin:0;
  }
  .container {
    max-width: 300px;
    padding: 1em;
    margin: auto;
    gap: 1em;
  }
  .container > * {
    margin: 0;
  }
</style>
