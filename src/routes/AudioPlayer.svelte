<script>
  import playlist from '../stores/playlistStore.js';
  import { onMount } from 'svelte';

  export let currentTrack;

  let audioPlayer;
  let audioSource;
  let playing = -1;
  let isPlaying = false;
  let currentTime = 0;
  let visualTime = 0;
  let duration = 0;
  let sliderContainer;
  let isDragging = false;

  $: if (currentTrack) {
    if (currentTrack.index !== playing) {
      playURL(currentTrack.download_url)
      playing = currentTrack.index;
    }
  } 

  function playURL(url) {
    if (!audioPlayer) return;
    audioSource.src = url;
    audioPlayer.load();
    audioPlayer.play();
    isPlaying = true;
    if (playing == -1) {
      isPlaying = false; // this is just a fix for the initial pause button
    }
  }

  function onTrackEnd() {
    playlist.nextTrack();
  }

  function togglePlayPause() {
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
    isPlaying = !isPlaying;
  }

  function updateTime() {
    if (!isDragging) {
      currentTime = audioPlayer.currentTime;
      visualTime = currentTime;
    }
  }

  function setCurrentTime(newTime) {
    audioPlayer.currentTime = newTime;
    currentTime = newTime;
    visualTime = newTime;
  }

  function handleSliderMouseDown(event) {
    event.preventDefault(); // Prevent default selection behavior
    isDragging = true;
    updateSliderPosition(event);
    window.addEventListener('mousemove', handleSliderMouseMove);
    window.addEventListener('mouseup', handleSliderMouseUp);
    document.body.style.userSelect = 'none'; // Disable text selection on the entire page
  }

  function handleSliderMouseMove(event) {
    if (isDragging) {
      updateSliderPosition(event);
    }
  }

  function handleSliderMouseUp() {
    if (isDragging) {
      isDragging = false;
      window.removeEventListener('mousemove', handleSliderMouseMove);
      window.removeEventListener('mouseup', handleSliderMouseUp);
      document.body.style.userSelect = ''; // Re-enable text selection
      setCurrentTime(visualTime);
    }
  }

  function updateSliderPosition(event) {
    const rect = sliderContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    visualTime = percentage * duration;
  }

  onMount(() => {
    audioPlayer.addEventListener('timeupdate', updateTime);
    audioPlayer.addEventListener('durationchange', () => {
      duration = audioPlayer.duration;
    });

    return () => {
      audioPlayer.removeEventListener('timeupdate', updateTime);
      audioPlayer.removeEventListener('durationchange', () => {});
    };
  });
</script>

<div class="audio-player">
  <button on:click={togglePlayPause} class = {isPlaying ? 'pause' : 'play'}> </button>
  
  <div class="slider-container" 
       bind:this={sliderContainer}
       on:mousedown={handleSliderMouseDown}
       on:touchstart|preventDefault={handleSliderMouseDown}>
    <div class="slider-background"></div>
    <div class="slider-progress" style="width: {100 - (visualTime / duration) * 100}%"></div>
    <img class="slider-thumb" style="left: calc({(visualTime / duration) * 100}% - 6px)" src="/nyancat.gif" />
  </div>
  
  <span>{formatTime(visualTime)} / {formatTime(duration)}</span>
</div>

<audio 
  bind:this={audioPlayer} 
  on:ended={onTrackEnd}
  style="display: none;"
>
  <source type="audio/mpeg" bind:this={audioSource}>
</audio>

<script context="module">
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<style>
  .audio-player {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 0 15px 0 0;
    background-color: #000;
    opacity: 0.90;
  }

  button {
    border: none;
    width: 46px;
    height: 46px;
    padding-left: 20px;
    background-color: #0000;
    cursor: pointer;
  }

  button.pause::after {
    content: '';
    display: block;
    border: 0;
    border-left: 3px solid white;
    border-right: 3px solid white;
    height: 18px;
    width: 6px;
    margin: 0px auto;
  }

  button.play::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-top: 8px inset transparent;
    border-bottom: 8px inset transparent;
    border-left: 16px solid white;
    border-right: 0;
    margin: 0px auto;
  }

  .slider-container {
    position: relative;
    height: 46px;
    flex-grow: 1;
    cursor: pointer;
    touch-action: none; 
    user-select: none;
  }

  .slider-background {
    position: absolute;
    top: calc(50% - 4px);
    left: 0;
    right: 0;
    bottom: 0;
    height: 8px;
    background: linear-gradient(to right, #ff0000, #ffa600 , #fbff00, #3cff00, #00eeff, #0004ff, #ea00ff, #ff00aa, #ff0000);
    animation: rainbow_animation 3s linear infinite reverse;
    background-size: 50% 100%;
  }

  .slider-progress {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #000000;
  }

  @keyframes rainbow_animation {
      0% {
          background-position: 0 0;
      }

      100% {
          background-position: 200% 0;
      }
  }

  .slider-thumb {
    position: absolute;
    top: 50%;
    width: 45px;
    height: 31px;
    transform: translateX(-15%) translateY(-50%);
  }

  span {
    color: white;
    font-size: 0.8em;
  }
</style>