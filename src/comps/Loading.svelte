<script>
  export let size = '50px';
</script>

<div class="loading icon" style={`width:${size};height:${size};`}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-nut-fill" viewBox="0 0 16 16">
		<path d="M4.58 1a1 1 0 0 0-.868.504l-3.428 6a1 1 0 0 0 0 .992l3.428 6A1 1 0 0 0 4.58 15h6.84a1 1 0 0 0 .868-.504l3.429-6a1 1 0 0 0 0-.992l-3.429-6A1 1 0 0 0 11.42 1H4.58zm5.018 9.696a3 3 0 1 1-3-5.196 3 3 0 0 1 3 5.196z"/>
	</svg>
</div>

<style>
  @keyframes rot {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .loading {
		/* display: inline-block; */
		position: relative;
    animation: rot 1s linear infinite;
  }
	
</style>
