<script>
  import { onMount, onDestroy } from 'svelte';
  import { downloadsStore } from '../../stores/downloadsStore';
  import { api } from '../../lib/api';

  let url = '';
  let message = '';
  let messageType = '';

  onMount(() => {
    downloadsStore.startFetching();
  });

  onDestroy(() => {
    downloadsStore.stopFetching();
  });

  async function downloadTrack() {
    if (!url) return;

    try {
      message = 'Adding track to download queue...';
      messageType = 'info';
      const data = await api.addTracksToQueue(url);

      message = data.message || 'Track added to download queue';
      messageType = 'success';
      url = '';
    } catch (error) {
      console.error('Error adding track to download queue:', error);
      message = 'An error occurred while adding the track to the download queue';
      messageType = 'error';
    }
  }

  async function redownloadTrack(uuid) {
    try {
      await api.redownloadTrack(uuid);
    } catch (error) {
      console.error('Error restarting track download:', error);
      message = 'An error occurred while restarting the track download';
      messageType = 'error';
    }
  }

  async function deleteTrack(uuid) {
    try {
      await api.deleteTrack(uuid);
    } catch (error) {
      console.error('Error deleting track:', error);
      message = 'An error occurred while deleting the track';
      messageType = 'error';
    }
  }
</script>

<main>
  <h1>Add New Track</h1>
  <div class="input-container">
    <input
      type="text"
      placeholder="Enter track/playlist URL"
      bind:value={url}
    />
    <button on:click={downloadTrack}>Download</button>
  </div>

  {#if message}
    <div class="message {messageType}">
      {message}
    </div>
  {/if}

  <h2>Download Queue</h2>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each $downloadsStore.tracks as track}
        <tr title="Album: {track.album || 'unknown'}&#013;Source: {track.extractor}&#013;Upvotes: {track.upvotes}&#013;Times Listened: {track.times_listened}">
          <td>{track.title}</td>
          <td>{track.download_status}</td>
          <td>
            <button on:click={() => redownloadTrack(track.uuid)}>Redownload</button>
            <button on:click={() => deleteTrack(track.uuid)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  main {
    max-width: min(60em, 95vw);
    margin: auto;
    padding: 2rem 0;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }

  .input-container {
    display: flex;
    gap: 1rem;
  }

  input {
    flex-grow: 1;
    padding: 0.5rem;
    font-size: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #45a049;
  }

  h2 {
    margin-top: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.8rem;
    text-align: left;
  }

  th {
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }

  .message {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: var(--black);
  }

  .success {
    color: var(--green);
    border: 1px solid var(--green);
  }

  .error {
    color: var(--red);
    border: 1px solid var(--red);
  }

  .info {
    color: var(--blue);
    border: 1px solid var(--blue);
  }
</style>