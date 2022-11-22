<script>
	import { navigate } from "@deps/routing";
</script>

<h1>Chunk</h1>

<p>
	To <a
		href="https://en.wikipedia.org/wiki/Chunking_%28psychology%29?wprov=sfla1"
		>chunk</a
	>, a process by which individual pieces of an information <b>set</b> are bound
	together into ➡️ a meaningful <b>whole</b>.
</p>

<p>
	I got tired of a mess everywhere. So I went lookig for a solution, but every
	one of them is overengineered, like everything else in this world.
	As a consequence they're hard to understand, slow to run in browsers, and
	don't offer the user experience a notes app should.
</p>

<p>
	So I decided to make my own. Design decisions have been heavily based on <b
		>functionlity</b
	>
	and <b>simplicity</b>. I want you to <i>feel</i> like they're <b>your</b>
	notes, suffice to say
	<a href="https://en.wikipedia.org/wiki/User_experience"
		><b>User Experience</b></a
	>
	was prioritized over
	<a href="https://en.wikipedia.org/wiki/User_interface"
		><b>User Interface</b></a
	>, although they are mostly
	<a href="https://en.wikipedia.org/wiki/Analogy">analogous</a>.
</p>

<p>Happy chunking 🗒️!</p>

<div style="text-align: center;">
<button on:click={() => navigate("/app")}>Go to App</button>
</div>