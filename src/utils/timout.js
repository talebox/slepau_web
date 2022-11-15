
/**
 * Like setTimeout, except if passed same id will bounce (clear previous timeout and set a new one, etc..)
 * @param {*} handler What to do
 * @param {*} time_ms Time to wait in ms
 */
export const debounceGenerator = () => {
	let t;
	return (handler, delay_ms) => {
		clearTimeout(t)
		t = setTimeout(handler, delay_ms);
	}
}

const timers = {}
/**
 * The default debounce function, with multiple timers
 * @param {*} handler 
 * @param {*} delay_ms 
 * @param {*} id 
 */
export const debounce = (handler, delay_ms, id = "default") => {
	if (!timers[id]) timers[id] = debounceGenerator();
	timers[id](handler, delay_ms)
};
