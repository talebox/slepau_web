import { SocketDB } from "../../common/stores/socket"
import { setStatus } from "../../common/stores/status"
import { fetchE } from "@utils/network"

class MediaDB extends SocketDB {
  constructor() {
    super("/stream")
  }
  on_open() {
    super.on_open()

    Object.entries(this.subs).forEach(
      ([k, v]) =>
        v.listening &&
        v.request_on !== false &&
        this.send({ resource: v.resource })
    )
  }
  /**
   * Request update for view subscribers with at least 1 listener
   */
  maybe_request_views() {
    Object.entries(this.subs).forEach(([k, v]) => {
      if (k.startsWith("views")) this.maybe_request_update(k)
    })
  }
  on_message(event) {
    let m = super.on_message(event)

    // Resource changes
    if (m.resource && !m.value) {
      if (m.resource === "media") {
        this.maybe_request_views()
      }
    }

    return m
  }
}

export const db = new MediaDB()

function mediaPost(v) {
  return fetchE("/media", { method: "POST", body: v }).then((v) => v.json())
}

export const actions = {
  media: {
    post: (v) =>
      setStatus(mediaPost(v), {
        timeout: 40000,
        on_resolve: "Upload success!",
      }),
    post_many: (v_array) =>
      setStatus(Promise.all(v_array.map((v) => mediaPost(v))), {
        timeout: 40000,
        on_resolve: "Upload success!",
      }),
  },
}
