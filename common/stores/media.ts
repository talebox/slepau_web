import { fetchE } from "../utils/network"
import { batch_upload } from "../utils/utils"
import notifications from "./notifications"
import { setStatus } from "./status"

let notification_id

const media = {
	post: (v) =>
		setStatus(
			fetchE("/media/media", { method: "POST", body: v }).then((v) => v.json()),
			{
				timeout: 40000,
				on_resolve: "Upload success!",
			}
		),
	post_many: (v_array) =>
		setStatus(batch_upload(
			v_array,
			(v: any) =>
				fetchE("/media/media", { method: "POST", body: v })
					.then((v) => v.json())
					.catch((err) => setStatus(Promise.reject(err.toString()))),
			({ result, done, left }) => {
				let value = `Uploaded ${done} of ${done + left}.`
				notification_id = notifications.add({
					id: notification_id,
					value,
					timeout: 0,
				})
			},
			(results: any[]) => {
				notifications.add({
					id: notification_id,
					timeout: 10000,
					value: `Uploaded ${results.length} items successfully!`,
				})
				notification_id = undefined
			}
		))
}

export default media