// Sets global HOST var (so Svelte can use it), as well as going through document replacing all appropriate links.

// Guess hostnames based on location.
function make_start(v, href) {
	let url = new URL(window.location.origin);
	url.hostname = url.hostname.replace(/.*(?=talebox\.\w+$)/, `${v === "talebox." ? "" : v}`)
	// if (!url.hostname.startsWith(v)) {
	// 	console.log(url.hostname)

	// }
	if (href) {
		let url_in = new URL(href);
		url.pathname = url_in.pathname;
		url.search = url_in.search;
		url.hash = url_in.hash;
	}
	return url
}

var HOSTS = {
	talebox: make_start("talebox."),
	auth: make_start("auth."),
	chunk: make_start("chunk."),
	media: make_start("media."),
	gibos: make_start("gibos."),
};

Object.entries(HOSTS).forEach(([k, v]) => {
	document.querySelectorAll(`a#${k}`).forEach((el) => {
		el.href = make_start(`${k}.`, el.href).href;
	})
})


