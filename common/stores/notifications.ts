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
  function add(n) {
    if (!n) return
    if (typeof n === "string") n = { value: n }
    if (typeof n === "object") {
      if (!n.id) n.id = ++_id

      update((v) => {
        v[n.id] = n
        return v
      })

      // If timeout === 0 don't remove the notification
      let timeout =
        typeof n.timeout === "number" ? n.timeout > 0 && n.timeout : 3000
      if (timeout) {
        n.timeout = setTimeout(() => remove(n.id), timeout)
      }
    }
    return n.id
  }
  /**
   * Update a notification, needs an id.
   * If you pass a timeout that's a num, we'll reset the clear timeout
   */
  function _update(n) {
    update((v) => {
      if (!v[n.id]) return v

      // If timeout === 0 don't remove the notification
      let { timeout, ...n_without_timeout } = n
      if (typeof timeout === "number") {
        clearTimeout(v[n.id].timeout)
        if (timeout > 0) {
          v[n.id].timeout = setTimeout(() => remove(n.id), timeout)
        }
      }

      Object.assign(v[n.id], n_without_timeout)
      return v
    })
  }
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
    update: _update,
  }
})()

export default notifications
