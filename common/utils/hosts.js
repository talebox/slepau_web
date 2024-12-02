// Sets global HOST var (so Svelte can use it), as well as going through document replacing all appropriate links.

let url = new URL(window.location.origin);

// This URL_IS_LOCAL is to handle 
globalThis.URL_IS_LOCAL = !url.hostname.includes("talebox.");
// url.hostname.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) || url.hostname === "localhost" || ;

// Guess hostnames based on location.
function make_app(v, href) {
	let url = new URL(window.location.origin);
	
	if (globalThis.URL_IS_LOCAL) {
		url.pathname = "/" + (v === "talebox" ? "" : v);
	} else {
		// Match specific app names
		url.hostname = url.hostname.replace(/^(samn|chunk|media|auth|gibos|vreji|lasna)\./, "");
		if (v !== 'talebox') {
			url.hostname = v + "." + url.hostname;
		}

		// url.hostname = url.hostname.replace(/.*(?=talebox\.\w+$)/, v === "talebox" ? "" : v + ".")
	}

	if (href) {
		let url_in = new URL(href);
		if (url_in.pathname !== "/"){
			url.pathname += url.pathname.endsWith("/") ? url_in.pathname.replace(/^\//, "") : url_in.pathname;
		}
			
		url.search = url_in.search;
		url.hash = url_in.hash;
	}
	return url
}

globalThis.HOSTS = {
	talebox: make_app("talebox"),
	auth: make_app("auth"),
	chunk: make_app("chunk"),
	media: make_app("media"),
	gibos: make_app("gibos"),
};

Object.entries(globalThis.HOSTS).forEach(([k, v]) => {
	document.querySelectorAll(`a#${k}`).forEach((el) => {
		el.href = make_app(`${k}`, el.href).href;
	})
})


