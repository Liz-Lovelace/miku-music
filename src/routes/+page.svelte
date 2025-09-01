<script>
  import playlist from '../stores/playlistStore.js';
  import Track from './Track.svelte';
  import MikuBox from './MikuBox.svelte';
  import CurrentTrackDisplay from './CurrentTrackDisplay.svelte';
  import AudioPlayer from './AudioPlayer.svelte';

  $: currentTrack = $playlist.tracks[$playlist.currentlyPlaying];
</script>

<MikuBox />

<main>
  <CurrentTrackDisplay {currentTrack} />

  <AudioPlayer {currentTrack} />

  <div id="trackList">
    {#each $playlist.tracks as track, i}
      {#if i - $playlist.currentlyPlaying > -2}
        <Track 
          title={track.title}
          album={track.album || ''}
          image={track.image_url}
          onclick={() => { playlist.playTrack(i) }}
          isCurrentlyPlaying={i == $playlist.currentlyPlaying}
        />
      {/if}
    {/each}
  </div>

  <a href="/add"> ADD NEW TRAX </a>
  <a href="/login"> log in </a>
</main>

<style>
  main {
    max-width: min(60em, 95vw);
    margin: auto;
  }

  #trackList {
    background-color: var(--black);
    opacity: 0.95;
    padding: 20px 0;
  }
</style>
