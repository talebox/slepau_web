<script>
  export let size
  import loading from "raw:@icons/nut-fill.svg"
</script>

<span class="loading" style={`width:${size ?? "50px"};height:${size ?? "50px"};`}>
  {@html loading}
</span>

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
    animation: rot 1s linear infinite;
  }
</style>
