import { fetchE } from "./network"

/**
 * This function applies a diff to a textarea string, moving the selection accordingly
 * @param {*} left current text
 * @param {*} diff array of changes ["K3", "D1", "AHello there"], this keeps 3 lines, and replaces the fourth by "Hello there"
 * @param {*} s [start,end] selection array, used to move selection on textarea based on changes to be made
 * @returns
 */
export function applyDiff(left, diff, s = []) {
	const offset_to_line = (str, offset) =>
		str
			.split("\n")
			// Map to length of line + newline except for last line
			.map((v, i, a) => v.length + (i + 1 === a.length ? 0 : 1))
			.reduce(
				(a, v) => {
					// If offset 0, means we've hit the end so return a; which is equvalent to a 'break;'
					if (offset == 0) return a
					const diff = offset - v
					if (diff < 0) {
						// Means offset is done for, signal offset exit by setting to 0
						a[1] = offset
						offset = 0
					} else {
						++a[0]
						offset -= v
					}
					return a
				},
				[0, 0]
			)

	/** Converts [line,offset] to absolute 'offset' */
	const line_to_offset = (str, [line, offset]) =>
		str
			.split("\n")
			.map((v, i, a) => v.length + (i + 1 === a.length ? 0 : 1))
			.reduce((a, v, i) => {
				if (i < line) {
					a += v
				}
				return a
			}, offset)

	// Selections by [line,offset]
	let sl = s.map((v) => offset_to_line(left, v))
	// Split text by lines
	let ll = left.split("\n")
	// Current line on text
	let i = 0
	for (let d of diff) {
		let c = d[0]
		let v = d.substring(1)
		if (c === "K") {
			i += Number(v)
		} else if (c === "A") {
			// Insert v at position i
			ll.splice(i, 0, v)
			// Add 1 line to all selections > than this line
			sl.forEach((s) => {
				if (s[0] >= i) ++s[0]
			})
			++i
		} else if (c === "D") {
			let lns = Number(v)
			while (lns-- > 0) {
				sl.forEach((s) => {
					if (s[0] > i) --s[0]
				})
				ll.splice(i, 1)
			}
		}

		if (i > ll.length) break
	}
	let right = ll.join("\n")
	let s_new = sl.map((v) => line_to_offset(right, v))
	return [right, s_new]
}

export const REGEX_TITLE = new RegExp(process.env.REGEX_TITLE)
export const REGEX_ACCESS = new RegExp(process.env.REGEX_ACCESS, "im")
export const REGEX_IMAGE = new RegExp(
	`\\(image\\/(${process.env.REGEX_PROQUINT})\\)`,
	"g"
)
export const REGEX_VIDEO = new RegExp(
	`\\(video\\/(${process.env.REGEX_PROQUINT})\\)`,
	"g"
)
export const REGEX_MEDIA = new RegExp(
	`\\(media\\/(${process.env.REGEX_PROQUINT})\\)`,
	"g"
)
export const REGEX_CHUNK = new RegExp(
	`\\(chunks?\\/(${process.env.REGEX_PROQUINT})\\)`,
	"g"
)

export const stringToColour = (str) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

export const SECONDS = {
	s: 1,
	m: 60,
	h: 60 * 60,
	d: 60 * 60 * 24,
	M: 60 * 60 * 24 * 30.4,
	Y: (new Date(2070, 0) - new Date(1970, 0)) / 1000 / 100 /** As of AD 2000 */,
}
// 31556925.445
/**
 * Turns seconds since epoch to pretty time elapsed since then
 * Something like `1s`, `1m`, etc...
 * @param {*} v
 * @returns [pretty time, millis until a change]
 */
export function passed_since_pretty(v) {
	const secs = Number(v)
	if (!secs) return
	let seconds = Date.now() / 1000 - secs
	if (seconds < 60) seconds = 60

	for (const [unit, value] of Object.entries(SECONDS).reverse()) {
		if (seconds >= value) {
			const v = seconds / value
			const exponent = ["M", "Y"].includes(unit) && v < 10 ? 1 : 0
			const accuracy = Math.pow(0.1, exponent)
			let secs_until = value * accuracy - (seconds % (value * accuracy))
			if (secs_until > SECONDS.d) {
				// To prevent overflow of the delay/interval
				secs_until = SECONDS.d
			}
			return [v.toFixed(exponent) + " " + unit, secs_until * 1000]
		}
	}
}
export function second_to_pretty(seconds, precision = 0) {
	for (const [unit, value] of Object.entries(SECONDS).reverse()) {
		if (Math.abs(seconds) >= value) {
			const v = seconds / value
			const exponent =
				precision || (["M", "Y"].includes(unit) && v < 10 ? 1 : 0)
			return v.toFixed(exponent) + " " + unit
		}
	}
}
/**
 * Turns `\d{1,2}[mhdwMy]` into seconds. Ex `1m` -> `60`
 * If `default` is supplied, this will be returned when the string can't be parsed
 */
export function parse_seconds(v, _default = undefined) {
	if (_default === undefined) _default = v
	if (typeof v !== "string") return v
	let match = /(\d{1,2})([mhdwMy])/.exec(v)
	if (match) {
		let [a, d, m] = match
		const m_s = SECONDS[m]
		const _d = Number(d)
		if (m_s && !Number.isNaN(_d)) {
			return _d * m_s
		}
	}
	return _default
}

const BYTES = { B: 1, KB: 2 ** 10, MB: 2 ** 20, GB: 2 ** 30 }

/**
 *
 */
export function bytes_to_pretty(bytes, precision = 0) {
	for (const [unit, value] of Object.entries(BYTES).reverse()) {
		if (Math.abs(bytes) >= value) {
			const v = bytes / value
			const exponent = precision || (unit != "B" && v < 10 ? 1 : 0)
			return v.toFixed(exponent) + " " + unit
		}
	}
}

const SI_PREFIX = {
	Y: 10 ** 24,
	Z: 10 ** 21,
	E: 10 ** 18,
	P: 10 ** 15,
	T: 10 ** 12,
	G: 10 ** 9,
	M: 10 ** 6,
	k: 10 ** 3,
	m: 10 ** -3,
	u: 10 ** -6,
	n: 10 ** -9,
	p: 10 ** -12,
	f: 10 ** -15,
	a: 10 ** -18,
	y: 10 ** -21,
	z: 10 ** -24,
}

/**
 * Turns si suffixed number into number. Ex `5k` -> `5000`
 * If `default` is supplied, this will be returned when the string can't be parsed
 */
export function parse_si_prefix(v, _default = undefined) {
	if (_default === undefined) _default = v
	if (typeof v !== "string") return v
	let match = /(\d+)(\w*)/.exec(v)
	if (match) {
		let digit = match[1]
		let multiplier = SI_PREFIX[match[2]] || 1
		digit = Number(digit)
		if (multiplier && !Number.isNaN(digit)) {
			return digit * multiplier
		}
	}
	return _default
}

export function str_insert(source, index, string) {
	if (index > 0) {
		return source.substring(0, index) + string + source.substr(index)
	}

	return string + source
}
export function str_remove(source, from, to) {
	return source.substring(0, from) + source.substring(to)
}

export function logout() {
	fetch(`/auth/logout`).then(() => location.href = "/")
}

const UPLOADS = {}
/**
 *
 * @param {*} files The file glob array
 * @param {*} upload_callback Callback (file) => Promise
 * @param {*} status_callback Gets {result (from Promise), done, left}
 * @param {*} done_callback Gets array of results [data,data]
 * @param {*} key
 */
export async function batch_upload(
	files,
	upload_callback,
	status_callback,
	done_callback = () => { },
	key = "default"
) {
	if (!Array.isArray(files)) return
	let store = UPLOADS[key]
	if (!store) {
		store = UPLOADS[key] = { queue: [], done: [] }
		store.queue.push(...files)
	} else {
		// If you found a store, someone else is using it, just add to the pile and return
		store.queue.push(...files)
		return
	}

	status_callback({
		undefined,
		done: store.done.length,
		left: store.queue.length,
	})
	while (store.queue.length) {
		try {
			const file = store.queue.splice(0, 1)[0]
			let result = await upload_callback(file)
			store.done.push(result)
			status_callback({
				result,
				done: store.done.length,
				left: store.queue.length,
			})
		} catch { }
	}
	done_callback(store.done)
	delete UPLOADS[key]
	return store.done
}

