import { get, Writable, writable } from "svelte/store"

let _id = 10

export const notifications = (() => {
  let { subscribe, set, update } = writable<any>({})
  function remove(id) {
    update((v) => {
      delete v[id]
      return v
    })
  }
  function do_timeout(n) {
    // If timeout === 0 don't remove the notification
  }
  function add(n) {
    if (!n) return
    if (typeof n === "string") n = { value: n }
    if (typeof n === "object") {
      if (!n.id) n.id = ++_id

      update((v) => {
        if (v[n.id]?.timeout) clearTimeout(v[n.id].timeout)

        n = v[n.id] = Object.assign(v[n.id] ?? {}, n)

        let timeout =
          typeof n.timeout === "number" ? n.timeout > 0 && n.timeout : 3000

        if (timeout) {
          console.log("Settting timeout for " + n.id)
          n.timeout = setTimeout(() => remove(n.id), timeout)
        }

        return v
      })
    }
    return n.id
  }
  /**
   * Update a notification, needs an id.
   * If you pass a timeout that's a num, we'll reset the clear timeout
   */
  function addError(n) {
    if (typeof n === "string") n = { value: n }
    if (typeof n === "object") {
      n.type = n.type ?? "error"
      n.timeout = n.timeout ?? 10000
    }
    add(n)
  }
  return {
    subscribe,
    add,
    addError,
    remove,
  }
})()

export default notifications
