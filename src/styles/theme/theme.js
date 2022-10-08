import light_url from 'raw:./light.css';
import dark_url from 'raw:./dark.css';
// import auto_url from 'raw:./water.css';


const stylesheet = document.createElement('link');
stylesheet.setAttribute('rel', "stylesheet");
document.head.insertAdjacentElement("beforeend", stylesheet);

const theme_get_local = () => {
	const ls = localStorage.getItem("theme");
	return typeof ls === 'undefined' ? undefined : ls === 'true';
}
export const theme_get = () => {
	return theme_get_local() ?? window.matchMedia("(prefers-color-scheme: light)").matches;
}

export const theme_set = (v) => {
	if (typeof v === undefined) {
		// set auto
		localStorage.removeItem('theme');
		stylesheet.setAttribute('href', auto_url);
	} else if (typeof v === 'boolean') {
		// set light/dark
		localStorage.setItem('theme', v);
		stylesheet.setAttribute('href', v ? light_url : dark_url);
	}
}

const theme_init = () => {
	const theme = theme_get_local();
	// if (typeof theme === 'boolean') {
	theme_set(theme)
	// }
}

theme_init()