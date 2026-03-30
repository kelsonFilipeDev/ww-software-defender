import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const authService = {
  getToken: async (clientId: string) => {
    const { data } = await api.post('/auth/token', { clientId });
    return data.accessToken as string;
  },
};

export const eventsService = {
  getAll: async () => {
    const { data } = await api.get('/events');
    return data;
  },
  getByEntityId: async (entityId: string) => {
    const { data } = await api.get(`/events/${entityId}`);
    return data;
  },
};

export const auditService = {
  getAll: async () => {
    const { data } = await api.get('/audit');
    return data;
  },
  getByEntityId: async (entityId: string) => {
    const { data } = await api.get(`/audit/${entityId}`);
    return data;
  },
};

export const stateService = {
  getByEntityId: async (entityId: string) => {
    const { data } = await api.get(`/state/${entityId}`);
    return data;
  },
};

export default api;
