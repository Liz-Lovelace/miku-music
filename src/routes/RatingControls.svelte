<script>
  import playlist from '../stores/playlistStore.js';

  $: currentTrack = $playlist.currentlyPlaying !== null ? $playlist.tracks[$playlist.currentlyPlaying] : null;
  $: upvotes = currentTrack ? currentTrack.upvotes || 0 : 0;

  function handleUpvote() {
    playlist.voteTrack(1);
  }

  function handleDownvote() {
    playlist.voteTrack(-1);
  }

  function handleDelete() {
    playlist.deleteCurrentTrack();
  }
</script>

{#if currentTrack}
  <div class="ratingControls">
    <button class="up-btn" on:click={handleUpvote}><img src="arrow.gif" /></button>
    <span>{upvotes}</span>
    {#if upvotes == 0}
      <button class="del-btn" on:click={handleDelete}>🗑</button>
    {:else}
      <button class="down-btn" on:click={handleDownvote}><img src="arrow.gif" /></button>
    {/if}
  </div>
{/if}

<style>
  .ratingControls {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      width: min-content;
  }

  .ratingControls span {
      width: 60px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 0.12em;
  }

  .ratingControls button {
      width: 60px;
      height: 60px;
      font-size: 30px;
  }

  .del-btn {
      border: 3px dashed #700;
      background-color: #e20e53;
      color: #fff;
      padding-top: 6px;
  }

  .down-btn {
      border: 0px dashed #930a0a;
      background-color: #0000;
      transition: border 0.1s, background-color 0.5s ease-in;
  }

  .down-btn:hover {
    border: 6px dashed #930a0a;
    box-shadow: 0 0 100px #f00, 0 0 40px #f00, 0 0 30px #f00;
  }

  .down-btn:active {
    background-color: #d10404;
    transition: none;
  }

  .down-btn img {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .up-btn {
      border: 0px outset #0093ff;
      background-color: #0000;
      transition: border 0.1s, background-color 0.5s ease-in;
  }

  .up-btn:hover {
    border: 6px outset #0093ff;
    box-shadow: 0 0 100px #0093ff, 0 0 40px #0093ff, 0 0 30px #0093ff;
  }

  .up-btn:active {
    background-color: #2fa9ff;
    transition: none;
  }

  .up-btn img {
    width: 100%;
    height: 100%;
    transform: rotate(90deg);
  }
</style>
