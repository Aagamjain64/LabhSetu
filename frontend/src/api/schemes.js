import api from './client';

export async function fetchSchemes({ search = '', state = '', category = '' } = {}) {
  const params = {};
  if (search) params.search = search;
  if (state) params.state = state;
  if (category) params.category = category;
  const { data } = await api.get('/api/schemes', { params });
  return data;
}

export async function fetchSchemeById(id) {
  const { data } = await api.get(`/api/schemes/${id}`);
  return data;
}

export async function fetchRecommendedSchemes() {
  const { data } = await api.get('/api/schemes/recommended/me');
  return data;
}
