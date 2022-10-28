import { Parser, HtmlRenderer } from "commonmark"

export const parser = new Parser();
export const renderer_html = new HtmlRenderer();

export function mdToHtml(md) { 
	if (!md) return null; 
	return renderer_html.render(parser.parse(md)) 
}