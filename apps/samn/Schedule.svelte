<script>
  import { debounce } from "@utils/timeout";
  import { db } from "./store";

  const schedule$ = db.subscribeTo(`schedule`);
  let editor_value;
  let preview_value;
  const cache = { first_value: false };
  $: {
    const schedule = $schedule$;
    if (!cache.first_value && schedule?.raw) {
      cache.first_value = true;
      editor_value = schedule.raw;
    }
    if (Array.isArray(schedule?.parsed?.events)) {
      const events = schedule.parsed.events;
      preview_value = events.map((v) => JSON.stringify(v)).join("\n");
    }
  }

  function update_value(value) {
    db.send({ resource: `schedule`, value });
  }
  function update_value_debounce(value) {
    debounce(() => {
      update_value(value);
    }, 500);
  }
</script>

<h2>Schedule Editor</h2>

<details>
  <summary>Expand for format explanation</summary>
  <p>This allows you to program a rudamentary schedule in the form of</p>
  <code style="white-space: pre-wrap; display:block"
    >{`
  alias <id> <name>
  ...

  at <time> for <id/name> set light on
  at <time> for <id/name> set light off
  ...
  `}</code
  >

  <ul>
    <li>where <code>id</code> is node id (u32 proquint)</li>
    <li>
      where <code>time</code> is
      <ul>
        <li>
          just an hour <code>8</code>, or with minutes
          <code>8:30</code>
        </li>
        <li>can be followed by <code>am</code> or <code>pm</code></li>
        <li>
          special strings allowed are <code>noon</code> and
          <code>midnight</code>
        </li>
      </ul>
    </li>
  </ul>
</details>

<h4>Editor</h4>
<textarea
  class="textarea"
  spellcheck="false"
  autocapitalize="off"
  autocorrect="off"
  bind:value={editor_value}
  on:input={(e) => {
    update_value_debounce(e.target.value);
  }}
/>
<hr />
<h4>Parsed Schedule</h4>
<textarea class="preview" readonly bind:value={preview_value} />

<style>
  .textarea {
    font-family: MonaspaceKrypton, monospace;
    min-height: 50vh;
  }
  .preview {
    overflow-x: auto;
    white-space: pre;
  }
</style>
