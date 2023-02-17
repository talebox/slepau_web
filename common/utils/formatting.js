import { Parser, HtmlRenderer } from "commonmark"
import { REGEX_ACCESS, REGEX_CHUNK, REGEX_MEDIA, REGEX_TITLE } from "./utils";

export const parser = new Parser();
export const renderer_html = new HtmlRenderer();

export function mdToHtml(md) {
	if (!md) return null;
	const parsed = parser.parse(md);
	return renderer_html.render(parsed)
}
export function valueTransform(value) {
	value = value.replace(REGEX_TITLE, (m, p1, p2) => `# ${p1} `);
	value = value.replace(/\[ \]/g, '&#x2610;');
	value = value.replace(/\[x\]/g, '&#x2612;');
	value = value.replace(/\[check\]/g, '&#x2713;');
	value = value.replace(REGEX_ACCESS, "");

	value = value.replace(REGEX_MEDIA, (m, id) => `(/api/media/${id})`);
	return value;
}

export function chunkValueToHtml(value) {
	value = valueTransform(value)
	console.log(value)
	value = value.replace(REGEX_CHUNK, (m, id) => `(/page/${id})`);
	return mdToHtml(value);
}