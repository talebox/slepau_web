/**
 * This function applies a diff to a textarea string, moving the selection accordingly
 * @param {*} left current text
 * @param {*} diff array of changes ["K3", "D1", "AHello there"], this keeps 3 lines, and replaces the fourth by "Hello there"
 * @param {*} s [start,end] selection array, used to move selection on textarea based on changes to be made
 * @returns 
 */
export function applyDiff(left, diff, s = []) {
	/** Converts absolute 'offset' to [line,offset] */
	// const offset_to_line = (str, offset) => {
	// 	if (offset > str.length) { return str.length }
	// 	let l = 0, i = 0, ll = 1;
	// 	while (i < str.length && i <= offset) { if (str[i] === '\n') { ++l; offset -= ll; ll = 0 } ++ll; ++i }
	// 	return [l, offset]
	// }
	const offset_to_line = (str, offset) => str
		.split('\n')
		// Map to length of line + newline except for last line
		.map((v, i, a) => v.length + (i + 1 === a.length ? 0 : 1))
		.reduce((a, v) => {
			// If offset 0, means we've hit the end so return a; which is equvalent to a 'break;'
			if (offset == 0) return a;
			const diff = offset - v;
			if (diff < 0) {
				// Means offset is done for, signal offset exit by setting to 0
				a[1] = offset;
				offset = 0;
			} else {
				++a[0]
				offset -= v;
			}
			return a
		}, [0, 0]);

	/** Converts [line,offset] to absolute 'offset' */
	const line_to_offset = (str, [line, offset]) => str
		.split('\n')
		.map((v, i, a) => v.length + (i + 1 === a.length ? 0 : 1))
		.reduce((a, v, i) => {
			if (i < line) {
				a += v;
			};
			return a
		}, offset);

	// Selections by [line,offset]
	let sl = s.map(v => offset_to_line(left, v));
	// Split text by lines
	let ll = left.split('\n');
	// Current line on text
	let i = 0;
	for (let d of diff) {
		let c = d[0];
		let v = d.substring(1);
		if (c === 'K') { i += Number(v); }
		else if (c === 'A') {
			// Insert v at position i
			ll.splice(i, 0, v);
			// Add 1 line to all selections > than this line
			sl.forEach((s) => { if (s[0] >= i) ++s[0] })
			++i;
		}
		else if (c === 'D') {
			let lns = Number(v);
			while (lns-- > 0) {
				sl.forEach((s) => { if (s[0] > i) --s[0] })
				ll.splice(i, 1);
			}
		}

		if (i > ll.length) break;
	}
	let right = ll.join('\n')
	let s_new = sl.map(v => line_to_offset(right, v))
	return [right, s_new]
}

export const REGEX_TITLE = new RegExp(process.env.REGEX_TITLE);
export const REGEX_ACCESS = new RegExp(process.env.REGEX_ACCESS, "im");
export const REGEX_MEDIA = new RegExp (`\\(media\\/(${process.env.REGEX_PROQUINT})\\)`, 'g');
export const REGEX_CHUNK = new RegExp (`\\(chunk\\/(${process.env.REGEX_PROQUINT})\\)`, 'g');

export function str_insert(source, index, string) {
	if (index > 0) {
		return source.substring(0, index) + string + source.substr(index);
	}

	return string + source;
};
export function str_remove(source, from, to) {
  return source.substring(0, from) + source.substring(to);
}