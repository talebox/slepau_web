export function cnf(s, ...v) {
	return v
		.filter(v => !!v && typeof v === 'string')
		.flatMap(v => v.split(' '))
		.map(v => s[v] ? s[v] : v)
		.filter(v => !!v)
		.join(' ')
}
function cnfc(s, ...v) {
	return () => cnf(s, ...v)
}
export default cnfc;