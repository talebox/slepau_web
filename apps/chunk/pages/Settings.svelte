<script>
  import Drawer from "../comps/Drawer.svelte"
  import User from "../comps/User.svelte"
  import { actions, db, local_settings$ } from "../store"
  import { parseDate } from "chrono-node"
  import {convert as parse_coordinate} from "geo-coordinates-parser"
  import { logout } from "@utils/utils"
  let photoInput

  function photoUpload() {
    if (!this.files.length) {
      console.error("no files selected")
      return
    }
    const files = Array.from(this.files)

    actions.media.post(files[0]).then((media) => {
      actions.auth.patch({ photo: media.id })
    })
  }
  function update_location(value) {
    try {
      const parsed = parse_coordinate(value)
      local_settings$.update((v) => ({
        ...v,
        location: [parsed.decimalLatitude, parsed.decimalLongitude],
      }))
    } catch {}
  }
</script>

<sctipt />

<Drawer />

<div class="page">
  <h1>Settings</h1>

  <p>Under construction 🚧</p>
  <hr />

  <div class="sections">
    <section class="user">
      <h2>User</h2>
      <User />
      <input
        bind:this={photoInput}
        on:change={photoUpload}
        type="file"
        accept="image/*"
        style="display:none;"
      />
      <button on:click={() => photoInput?.click()}>
        <svg fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
          />
          <path
            d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"
          />
        </svg>
        Set Profile Photo
      </button>

      <button on:click={logout}>Logout</button>
    </section>
    <section>
      <h2>Preferences</h2>

      <label>
        Experimental Features
        <input
          type="checkbox"
          bind:checked={$local_settings$.experimental_features}
        />
      </label>
      <label>
        Lojban <input type="checkbox" bind:checked={$local_settings$.lojban} />
      </label>
      <details>
        <summary
          >Your Birthdate <code>{$local_settings$.birthday || "Undefined"}</code
          ></summary
        >
        <p>
          You can use natural language:<br />
          <code>june 20th of 1995</code><br /> <code>6/20/1995</code>
        </p>
        <p>
          and if you know the time, just include it like so <code> at 2pm</code>
          or
          <code> 2am</code>.
        </p>

        <p>This is currently only being used on the clock.</p>
        <input
          class="fw border"
          placeholder="june 20th of 1995 at 2am"
          bind:value={$local_settings$.birthday}
        />
        <p style="opacity: .5;">
          The parsed date is: {parseDate($local_settings$.birthday)}
        </p>
      </details>
      <details>
        <summary
          >Your Location <code
            >{`${$local_settings$.location?.[0]}, ${$local_settings$.location?.[1]}`}</code
          ></summary
        >
        <p>Any of these formats are accepted:</p>
        <ul>
          <li>Decimal degrees (DD): <code>41.40338, 2.17403</code></li>
          <li>
            Degrees, minutes, and seconds (DMS): <code
              >41°24'12.2"N 2°10'26.5"E</code
            >
          </li>
          <li>
            Degrees and decimal minutes (DMM): <code>41 24.2028, 2 10.4418</code
            >
          </li>
        </ul>

        <p>This is currently only being used on the clock.</p>
        <input
          class="fw border"
          value={`${$local_settings$.location?.[0]}, ${$local_settings$.location?.[1]}`}
          on:blur={(e) => update_location(e.target.value)}
        />
      </details>
    </section>
    <section class="version">
      <h2>Info</h2>
      <table>
        <tr><td>App Version:</td><td>{process.env.APP_VERSION}</td></tr>
				<tr><td>Build Time:</td><td>{process.env.APP_BUILD_TIME}</td></tr>
      </table>
    </section>
  </div>
</div>

<style>
  .version td:first-child {
    text-align: right;
  }
  .sections > * {
    display: flex;
    flex-flow: column;
    gap: 8px;
    justify-items: center;
  }
  .sections code {
    display: contents;
  }
  .sections details {
    margin: 0;
  }

  .sections h2 {
    text-align: center;
  }
  .sections {
    display: grid;
    gap: 0.5em;
    grid-template-columns: repeat(1, 1fr);
  }
  @media (min-width: 36rem) {
    .sections {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
