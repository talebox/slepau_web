export function applyDiff(left, diff, s=[]) {
	// if (!Array.isArray(diff))return ;
	const offset_to_line = (str, offset) => {
		if (offset > str.length) { return str.length }
		let l = 0, i = 0, ll = 1;
		while (i < str.length && i <= offset) { if (str[i] === '\n') { ++l; offset -= ll; ll = 0 } ++ll; ++i }
		return [l, offset]
	}
	const line_to_offset = (str, [line, offset]) => str
		.split('\n')
		.map(v => v.length)
		.reduce((a, v) => {
			if (line-- > 0) {
				a += v + 1;
			};
			return a
		}, offset);

	let sl = s.map(v => offset_to_line(left, v));
	let ll = left.split('\n');
	let i = 0;
	for (let d of diff) {
		let c = d[0];
		let v = d.substring(1);
		if (c === 'K') { i += Number(v); }
		else if (c === 'A') {
			ll.splice(i, 0, v);
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
export const REGEX_ACCESS = new RegExp(process.env.REGEX_ACCESS_JS, "im");