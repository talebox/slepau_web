
/**
 * Like setTimeout, except if passed same id will bounce (clear previous timeout and set a new one, etc..)
 * @param {*} handler What to do
 * @param {*} time_ms Time to wait in ms
 * @param {*} id Name of delay id to use
 */
export function useDelay(handler, time_ms, id) {
	const t = () => setTimeout(handler, time_ms);
	if (typeof id !== 'undefined') {
		if (this[id]) clearTimeout(this[id]);
		this[id] = t()
	} else {
		t()
	}
}