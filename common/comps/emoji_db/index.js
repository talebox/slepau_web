import { BufferReader } from './buffers'

/**
 * Parses the database into a searchable RAM datastructure.
 * @param {*} buffer
 * @returns search function (query: String)
 */
function _init_search(buffer) {
	/* ---- 1. Load everything into a reader --- */
	const reader = new BufferReader(buffer);
	/* ---- 2. Emoji table --------------------- */
	const emojis = [];
	const names = [];
	const emojiCount = reader.readVarUint();
	for (let i = 0; i < emojiCount; i++) {
		emojis.push(reader.readString())
		names.push(reader.readString())
	}
	function read_node() {
		let list_length = reader.readU8();
		const list = [];
		const children = {};
		for (let i = 0; i < list_length; ++i) list.push(reader.readVarUint());
		let continues = false;
		do {
			let ch_continues = reader.readU8();
			if (ch_continues > 0) {
				continues = !!((ch_continues >> 7) & 1);
				let ch = String.fromCharCode(ch_continues & 0x7F);
				children[ch] = read_node()
			}
		} while (continues);
		return { list, children }
	}
	const root = read_node();

	function get_emoji_list(query, node = root) {
		let ch = query[0]
		if (!ch) return node.list;
		let child = node.children[ch];
		if (!child) return [];
		return get_emoji_list(query.slice(1), child)
	}
	function search(query) {
		query = query.toLowerCase();

		let words = query.split(/\s+/);
		let lists = words.map(word => get_emoji_list(word));
		let all = new Set(lists.flat());
		// Sort all emojis by how many lists they appear in...
		// So when searching for "happy cat" the first emojis are the ones in both words
		let sorted = [...all].map(e => [e, lists.filter(l => l.includes(e)).length]).sort((a, b) => b[1] - a[1]).map(v => v[0])

		const emojiIDs = sorted;
		return emojiIDs.map(id => ({ emoji: emojis[id], name: names[id] }));
	}
	return search;
}

// import fs from 'fs';
// export const emoji_db = fs.readFileSync(__dirname + '/emoji_index2.db');

import db_url from "url:./emoji_index2.db"
export default async function init_search() {
	let db = await fetch(db_url, { cache: 'force-cache' });
	return _init_search(await db.arrayBuffer())
}