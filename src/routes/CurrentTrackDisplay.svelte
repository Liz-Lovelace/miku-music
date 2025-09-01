<script>
  import RatingControls from './RatingControls.svelte';
  import playlist from '../stores/playlistStore.js';
  import { formatDistanceToNow } from 'date-fns';
  
  export let currentTrack;

  function formatTimeAgo(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
</script>

<div class="current-track-display">
  {#if currentTrack}
    <img src={currentTrack.image_url} alt={currentTrack.title} />
    <div class="track-info">
      <div class="left-info">
        <h2 class="track-title">{currentTrack.title}</h2>
        <p class="album-name">{currentTrack.album || ''}</p>
        <p class="listen-count">Listened {currentTrack.times_listened} times</p>
        <p class="download-info">
          Downloaded {formatTimeAgo(currentTrack.createdAt)} from 
          <a href={currentTrack.track_url} target="_blank">{currentTrack.extractor}</a>
        </p>
      </div>
      <RatingControls />
      </div>
  {/if}
</div>

<style>
  .current-track-display {
    display: flex;
    background-color: var(--black);
    margin: 30px 0 0;
    height: 250px;
    opacity: 0.95;
    overflow: hidden;
  }

  .current-track-display img {
    height: 250px;
    width: 250px;
    object-fit: cover;
  }

  .track-info {
    padding: 1em 1.5em;
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .left-info {
    display: flex;
    flex-direction: column;
    gap: 0.3em;
  }

  .left-info * {
    margin: 0;
  }

  .track-title {
    font-size: 1.7em;
    font-weight: bold;
  }

  .album-name {
    flex: 1;
  }

  .download-info a {
    color: var(--cyan);
    text-decoration: none;
  }

  .download-info a:hover {
    text-decoration: underline;
  }
</style>