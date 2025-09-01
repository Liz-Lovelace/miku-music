import { writable } from 'svelte/store';
import { api } from '../lib/api';

async function fetchPlaylist() {
  try {
    const data = await api.fetchPlaylist();
    return data.map((track, index) => ({...track, index}));
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return [];
  }
}

function createPlaylistStore() {
  const { subscribe, set, update } = writable({
    currentlyPlaying: 0,
    tracks: [],
  });

  fetchPlaylist().then(fetchedTracks => {
    update(currentState => ({
      ...currentState,
      tracks: fetchedTracks,
    }));
  });

  return {
    playTrack: (index) => {
      update(obj => ({
        ...obj,
        currentlyPlaying: index,
      }));
    },
    nextTrack: () => {
      update(obj => {
        if (obj.currentlyPlaying === null || obj.tracks.length === 0 || obj.tracks.length === obj.currentlyPlaying + 1) return obj;
        
        const currentTrack = obj.tracks[obj.currentlyPlaying];
        if (currentTrack) {
          api.markAsListened(currentTrack.uuid)
            .catch(error => console.error('Error marking track as listened:', error));
        }

        const nextIndex = obj.currentlyPlaying + 1;
        return {
          ...obj,
          currentlyPlaying: nextIndex,
        };
      });
    },
    voteTrack: (voteValue) => {
      update(obj => {
        if (obj.currentlyPlaying === null) return obj;
        
        const updatedTracks = [...obj.tracks];
        const currentTrack = updatedTracks[obj.currentlyPlaying];
        
        if (currentTrack) {
          const newUpvotes = Math.max(0, (currentTrack.upvotes || 0) + voteValue);
          updatedTracks[obj.currentlyPlaying] = {
            ...currentTrack,
            upvotes: newUpvotes
          };

          api.voteTrack(currentTrack.uuid, voteValue)
            .catch(error => console.error('Error voting on track:', error));
        }
        
        return {
          ...obj,
          tracks: updatedTracks,
        };
      });
    },
    deleteCurrentTrack: () => {
      update(obj => {
        if (obj.currentlyPlaying === null) return obj;

        const currentTrack = obj.tracks[obj.currentlyPlaying];
        if (!currentTrack) return obj;

        api.deleteTrack(currentTrack.uuid)
          .catch(error => console.error('Error deleting track:', error));

        const updatedTracks = obj.tracks.filter((_, index) => index !== obj.currentlyPlaying);
        const newCurrentlyPlaying = obj.currentlyPlaying < updatedTracks.length ? obj.currentlyPlaying : null;

        return {
          ...obj,
          tracks: updatedTracks,
          currentlyPlaying: newCurrentlyPlaying,
        };
      });
    },
    subscribe,
  };
}

export default createPlaylistStore();