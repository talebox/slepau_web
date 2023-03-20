<script>
	import { Router, Route, Link } from "@deps/routing";
	import Status from "@comps/Status.svelte";

	import Notifications from "@comps/Notifications.svelte";
	import All from "./All.svelte";
	import { actions, db } from "./store";
	import Details from "./Details.svelte";
	import notifications from "../../common/stores/notifications";

	const tasks$ = db.subscribeTo("tasks", { init_with: 0 });
	$: tasks = $tasks$;
	let not_id;
	$: {
		// console.log(tasks);

		const value = tasks ? `Tasks queued ${tasks}.` : `Tasks done!`;
		not_id = notifications.add({
			value,
			id: not_id,
			timeout: tasks ? 0 : 3000,
		});
	}

	function dragover(ev) {
		console.log("In drop zone");

		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();
	}
	function drop(ev) {
		console.log("Dropped");

		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();

		let files = [];

		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			files = [...ev.dataTransfer.items]
				.filter((v) => v.kind === "file")
				.map((v) => v.getAsFile());
		} else {
			// Use DataTransfer interface to access the file(s)
			files = [...ev.dataTransfer.files];
		}
		actions.media.post_many(files);
	}
</script>

<svelte:body on:drop={drop} on:dragover={dragover} />

<Notifications />
<Status />

<Router basepath="/app">
	<Route component={All} />
</Router>

<Details />

<style>
</style>
