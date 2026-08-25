import api from './client';

export async function fetchStateAdminStats() {
  const { data } = await api.get('/api/state-admin/stats');
  return data;
}

export async function fetchStateAdminSchemes({ search = '' } = {}) {
  const params = {};
  if (search) params.search = search;
  const { data } = await api.get('/api/state-admin/schemes', { params });
  return data;
}

export async function createStateAdminScheme(payload) {
  const { data } = await api.post('/api/state-admin/schemes', payload);
  return data;
}

export async function updateStateAdminScheme(id, payload) {
  const { data } = await api.put(`/api/state-admin/schemes/${id}`, payload);
  return data;
}

export async function deleteStateAdminScheme(id) {
  const { data } = await api.delete(`/api/state-admin/schemes/${id}`);
  return data;
}

export async function fetchStateAdminUsers({ page = 1, search = '' } = {}) {
  const params = { page };
  if (search) params.search = search;
  const { data } = await api.get('/api/state-admin/users', { params });
  return data;
}

export async function deleteStateAdminUser(id) {
  const { data } = await api.delete(`/api/state-admin/users/${id}`);
  return data;
}
