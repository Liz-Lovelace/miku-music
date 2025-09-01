import { writable } from 'svelte/store';
import { api } from '../lib/api';

function createAuthStore() {
  const { subscribe, set, update } = writable({
    username: null,
    messages: {},
  });

  async function fetchUserInfo() {
    const userInfo = await api.getUserInfo();
    update(state => ({
      ...state,
      username: userInfo.username || null,
    }));
  }

  fetchUserInfo()

  return {
    subscribe,
    register: async (username, password1, password2) => {
      try {
        const response = await api.register(username, password1, password2);
        update(state => ({ ...state, messages: response.messages || {} }));
        if (!response.messages || Object.keys(response.messages).length === 0) {
          await fetchUserInfo();
        }
      } catch (error) {
        console.error('Registration error:', error);
        update(state => ({ ...state, messages: { registerOther: ['An error occurred during registration'] } }));
      }
    },
    login: async (username, password) => {
      try {
        const response = await api.login(username, password);
        update(state => ({ 
          ...state, 
          messages: response.messages || {}
        }));
        if (!response.messages || Object.keys(response.messages).length === 0) {
          await fetchUserInfo();
        }
      } catch (error) {
        console.error('Login error:', error);
        update(state => ({ ...state, messages: { loginOther: ['An error occurred during login'] } }));
      }
    },
    logout: async () => {
      try {
        await api.logout();
        set({ username: null, messages: {} });
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
  };
}

export const authStore = createAuthStore();