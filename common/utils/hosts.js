// Sets global HOST var (so Svelte can use it), as well as going through document replacing all appropriate links.

let url = new URL(window.location.origin);

var URL_IS_LOCAL = !url.hostname.includes("talebox.")
// url.hostname.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) || url.hostname === "localhost" || ;

// Guess hostnames based on location.
function make_app(v, href) {
	let url = new URL(window.location.origin);
	
	if (URL_IS_LOCAL) {
		url.pathname = "/" + (v === "talebox" ? "" : v);
	} else {
		url.hostname = url.hostname.replace(/.*(?=talebox\.\w+$)/, v === "talebox" ? "" : v + ".")
	}

	if (href) {
		let url_in = new URL(href);
		if (url_in.pathname !== "/")
			url.pathname += url_in.pathname;
		url.search = url_in.search;
		url.hash = url_in.hash;
	}
	return url
}

var HOSTS = {
	talebox: make_app("talebox"),
	auth: make_app("auth"),
	chunk: make_app("chunk"),
	media: make_app("media"),
	gibos: make_app("gibos"),
};

Object.entries(HOSTS).forEach(([k, v]) => {
	document.querySelectorAll(`a#${k}`).forEach((el) => {
		el.href = make_app(`${k}`, el.href).href;
	})
})

