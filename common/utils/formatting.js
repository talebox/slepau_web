import { Parser, HtmlRenderer } from "commonmark"
import { REGEX_ACCESS, REGEX_CHUNK, REGEX_IMAGE, REGEX_MEDIA, REGEX_TITLE, REGEX_VIDEO } from "./utils";

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
	
	console.log(value)
  
  value = value.replace(REGEX_IMAGE, (m,id) => 
  `<img
		style="display: block"
		src="/media/${id}?max=800x"
		srcset="
			/media/${id}?max=480x   480w,
			/media/${id}?max=800x   800w,
			/media/${id}?max=1200x 1200w,
			/media/${id}?max=x 1600w
		"
		sizes="(min-width:800px) 800px, 100vw"
	/>`
  )
	value = value.replace(REGEX_VIDEO, (m,id) => 
  `<video controls> 
	<source src="/media/${id}?type=video/webm" type="video/webm" />
	<source src="/media/${id}?c_v=libx264&c_a=aac&b_v=2M&b_a=90k&type=video/mp4" type="video/mp4" />\
		Your browser doesn't support HTML video. Click to download\
		<a href="/media/${id}?c_v=libx264&c_a=aac&b_v=2M&b_a=90k&type=video/mp4">${id}</a> instead.\
</video>`
  )
	
	
  
	value = value.replace(REGEX_MEDIA, (m, id) => `(/media/${id})`);
	return value;
}

export function chunkValueToHtml(value) {
	value = valueTransform(value)
	
	value = value.replace(REGEX_CHUNK, (m, id) => `(/page/${id})`);
	return mdToHtml(value);
}