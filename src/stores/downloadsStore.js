import { writable } from 'svelte/store';
import { api } from '../lib/api';

function createDownloadsStore() {
  const { subscribe, set, update } = writable({ tracks: [] });
  let fetchInterval;

  const startFetching = () => {
    fetchDownloads();
    fetchInterval = setInterval(fetchDownloads, 1000);
  };

  const stopFetching = () => {
    if (fetchInterval) {
      clearInterval(fetchInterval);
      fetchInterval = null;
    }
  };

  const fetchDownloads = async () => {
    try {
      const downloads = await api.fetchDownloads();
      update(store => ({ ...store, tracks: downloads }));
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    }
  };

  return {
    subscribe,
    startFetching,
    stopFetching
  };
}

export const downloadsStore = createDownloadsStore();