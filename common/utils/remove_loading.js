
export default function remove_loading() {
	// Remove loading element
	document.getElementById("loading")?.classList.add("close");
	setTimeout(() => {
		document.getElementById("preload")?.remove();
		document.getElementById("loading")?.remove();
	}, 200);
}