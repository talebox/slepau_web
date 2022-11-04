import { Parser, HtmlRenderer } from "commonmark"
import { REGEX_ACCESS, REGEX_TITLE } from "./utils";

export const parser = new Parser();
export const renderer_html = new HtmlRenderer();

export function mdToHtml(md) { 
	if (!md) return null; 
	return renderer_html.render(parser.parse(md)) 
}
export function chunkValueToHtml(value){
	value = value.replace(REGEX_TITLE, (m, p1, p2) => `# ${p1} `);
	value = value.replace(/\[ \]/g, '&#x2610;');
	value = value.replace(/\[x\]/g, '&#x2612;');
	value = value.replace(/\[check\]/g, '&#x2713;');
	value = value.replace(REGEX_ACCESS, "");
	return mdToHtml(value);
}