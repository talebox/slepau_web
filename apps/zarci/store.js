import { SocketDB } from "@stores/socket"
import { setStatus } from "@stores/status"
import media from "@stores/media"

class ZarciDB extends SocketDB {
	constructor() {
		super("/zarci/stream")
	}
}

export const db = new ChunkDB()