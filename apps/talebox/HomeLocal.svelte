<h2>Local 🏡</h2>
<p>This is <u>your</u> <b>local instance</b>.</p>
<div class="firework" />
<p>
	You did it, you're independent now!<br />
	Let's celebrate 🎉!
</p>
<p>
	Keep <a href="run.html"><b>sharing me</b></a> ❤️
</p>

<style>
	.firework,
	.firework::before,
	.firework::after {
		pointer-events: none;
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.5vmin;
		aspect-ratio: 1;
		background:
    /* random backgrounds */
    radial-gradient(circle, rgb(0, 179, 206) 0.2vmin, #0000 0) 50% 00%,
    radial-gradient(circle, rgb(0, 179, 206) 0.3vmin, #0000 0) 00% 50%,
    radial-gradient(circle, rgb(0, 179, 206) 0.5vmin, #0000 0) 50% 99%,
    radial-gradient(circle, rgb(0, 179, 206) 0.2vmin, #0000 0) 99% 50%,
    radial-gradient(circle, rgb(0, 179, 206) 0.3vmin, #0000 0) 80% 90%,
    radial-gradient(circle, rgb(0, 179, 206) 0.5vmin, #0000 0) 95% 90%,
    radial-gradient(circle, rgb(0, 179, 206) 0.5vmin, #0000 0) 10% 60%,
    radial-gradient(circle, rgb(0, 179, 206) 0.2vmin, #0000 0) 31% 80%,
    radial-gradient(circle, rgb(0, 179, 206) 0.3vmin, #0000 0) 80% 10%,
    radial-gradient(circle, rgb(0, 179, 206) 0.2vmin, #0000 0) 90% 23%,
    radial-gradient(circle, rgb(0, 179, 206) 0.3vmin, #0000 0) 45% 20%,
    radial-gradient(circle, rgb(0, 179, 206) 0.5vmin, #0000 0) 13% 24%;
		background-size: 0.5vmin 0.5vmin;
		background-repeat: no-repeat;
		animation: firework 7s infinite cubic-bezier(0.1,.6,.5,1);
	}
	.firework::before {
		transform: translate(-50%, -50%) rotate(25deg) !important;
	}
	.firework::after {
		transform: translate(-50%, -50%) rotate(-37deg) !important;
	}

	@keyframes firework {
		/* 0% {
			transform: translate(0%, 20vh);
			width: 0.5vmin;
			opacity: 1;
		} */
		0% {
			width: 0.5vmin;
			opacity: 1;
		}
		/* 40% {
			width: 50vmin;
			opacity: 0.3;
		} */
		90% {
			width: 70vmin;
			opacity: 0;
		}
		100% {
			width: 70vmin;
			opacity: 0;
		}
	}
</style>
