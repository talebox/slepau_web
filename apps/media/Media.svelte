<script>
	import All from "./All.svelte";
import { make_query, query_from_uri } from "./store";

	export let media;
	export let query = "";
	$: is_video =
		!query_from_uri(query)?.type?.startsWith("image") 
		&&
		media?.meta.type?.startsWith("video");

	let loaded = is_video;
	let error;
	$: {
		if (query) {
		}
		error = undefined;
		loaded = is_video;
	}
	function on_load() {
		loaded = true;
	}
	function on_error(error_string) {
		error = "Fetch error.";
	}
</script>

{#if is_video}
	<video controls {...$$props}>
		<source src="/media/{media.id}{make_query(query)}" />
		<track kind="captions" />
	</video>
{:else}
	<img
		on:error={on_error}
		on:load={on_load}
		alt
		src="/media/{media.id}{make_query(query)}"
		{...$$props}
	/>
{/if}

{#if !loaded || error}
	<div class="full backdrop">
		{#if error}
			{error}
		{:else}
			<svg
				width="38"
				height="38"
				viewBox="0 0 38 38"
				xmlns="http://www.w3.org/2000/svg"
				style="padding:10%"
			>
				<defs>
					<linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
						<stop stop-color="#fff" stop-opacity="0" offset="0%" />
						<stop stop-color="#fff" stop-opacity=".631" offset="63.146%" />
						<stop stop-color="#fff" offset="100%" />
					</linearGradient>
				</defs>
				<g fill="none" fill-rule="evenodd">
					<g transform="translate(1 1)">
						<path
							d="M36 18c0-9.94-8.06-18-18-18"
							id="Oval-2"
							stroke="url(#a)"
							stroke-width="2"
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								from="0 18 18"
								to="360 18 18"
								dur="0.9s"
								repeatCount="indefinite"
							/>
						</path>
						<!-- <circle fill="#fff" cx="36" cy="18" r="1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </circle> -->
					</g>
				</g>
			</svg>
		{/if}
	</div>
{/if}

<style>
	img {
		object-fit: contain;
	}
	img,
	video {
		width: 100%;
		height: 100%;
	}
	.backdrop {
		backdrop-filter: blur(5px);
		background: #0004;
	}
	.full,
	.full > * {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
