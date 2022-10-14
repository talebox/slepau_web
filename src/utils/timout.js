
/**
 * Like setTimeout, except if passed same id will bounce (clear previous timeout and set a new one, etc..)
 * @param {*} handler What to do
 * @param {*} time_ms Time to wait in ms
 * @param {*} id Name of delay id to use
 */

export const debounceG = () => {
	const timers = {};
	return (handler, time_ms, id) => {
		clearTimeout(timers[id])
		timers[id]=setTimeout(handler, time_ms);
	}
}

export const useDebounce = debounceG();
