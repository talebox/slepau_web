import light_url from 'raw:./light.css';
import dark_url from 'raw:./dark.css';
import auto_url from 'raw:./water.css';

const stylesheet = document.createElement('link');
stylesheet.setAttribute('rel', "stylesheet");
document.head.insertAdjacentElement("beforeend", stylesheet);

export const theme_get = () => {
	const ls = localStorage.getItem("theme");
	return ls === undefined || ls === null ? undefined : ls === 'true';
}
export const prefers_light = window.matchMedia("(prefers-color-scheme: light)").matches;

export const theme_set = (v) => {
	if (v === undefined || v === null) {
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
	theme_set(theme_get())
}

theme_init()