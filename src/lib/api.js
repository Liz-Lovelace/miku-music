const API_URL = import.meta.env.NODE_ENV == 'production' ? '/api' : 'http://localhost:1273/api';

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  fetchPlaylist: () => fetchJson('/playlist'),
  
  markAsListened: (uuid) => fetchJson('/listened', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid }),
  }),
  
  voteTrack: (uuid, vote) => fetchJson('/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid, vote }),
  }),
  
  fetchDownloads: () => fetchJson('/track-queue'),

  deleteTrack: (uuid) => fetchJson('/delete-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid }),
  }),
  
  addTracksToQueue: (url) => fetchJson('/download-tracks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }),

  redownloadTrack: (uuid) => fetchJson('/redownload-track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid }),
  }),

  register: (username, password1, password2) => fetchJson('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password1, password2 }),
  }),

  login: (username, password) => fetchJson('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }),

  logout: () => fetchJson('/logout', { method: 'POST' }),

  getUserInfo: () => fetchJson('/myUserInfo'),
};
