<script>
  export let title = 'untitled';
  export let album = '';
  export let image = null;
  export let onclick;
  export let isCurrentlyPlaying = false;
</script>

<div class="track" class:currently-playing={isCurrentlyPlaying} on:click={onclick}>
  <img class="album-art" src={image} />
  <div>
    <p class="trackTitle"> {title}</p>
    <p> {album} </p>
  </div>
</div>

<style>
  .track{
      padding: 10px 20px;
      display: flex;
  }

  .track:hover {
      background-color: #fff1;
  }

  .track p {
      margin: 0;
  }


  .trackTitle {
      font-size: 1.3em;
  }

  .currently-playing {
      font-weight: bold;
      background-color: #fff1;
      border: 1px solid magenta;
  }

  .album-art {
    height: 60px;
    width: 60px;
    object-fit: cover;
    margin-right: 10px;
  }
</style>
