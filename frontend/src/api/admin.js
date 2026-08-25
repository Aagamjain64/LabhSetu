import api from './client';

export async function fetchAdminStats() {
  const { data } = await api.get('/api/admin/stats');
  return data;
}

export async function fetchAdminUsers({ page = 1, search = '', role = '' } = {}) {
  const params = { page };
  if (search) params.search = search;
  if (role) params.role = role;
  const { data } = await api.get('/api/admin/users', { params });
  return data;
}

export async function updateUserRole(id, role, assignedState = '') {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role, assignedState });
  return data;
}

export async function fetchIndianStates() {
  const { data } = await api.get('/api/locations/states');
  return data.states || [];
}

export async function deleteAdminUser(id) {
  const { data } = await api.delete(`/api/admin/users/${id}`);
  return data;
}

export async function fetchAdminSchemes({ search = '', ownerState = '' } = {}) {
  const params = {};
  if (search) params.search = search;
  if (ownerState) params.ownerState = ownerState;
  const { data } = await api.get('/api/admin/schemes', { params });
  return data;
}

export async function createAdminScheme(payload) {
  const { data } = await api.post('/api/admin/schemes', payload);
  return data;
}

export async function updateAdminScheme(id, payload) {
  const { data } = await api.put(`/api/admin/schemes/${id}`, payload);
  return data;
}

export async function deleteAdminScheme(id) {
  const { data } = await api.delete(`/api/admin/schemes/${id}`);
  return data;
}
