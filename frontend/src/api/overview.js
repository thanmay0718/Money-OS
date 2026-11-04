// src/api/overview.js
import api from './axios'

const BASE = '/api/overview'

export const overviewApi = {
  getSummary: (params = {}) => api.get(`${BASE}/summary`, { params }),

  getHeatmap: (params = {}) => api.get(`${BASE}/heatmap`, { params }),

  getActivities: (params = {}) => api.get(`${BASE}/activities`, { params }),

  getActivityDetail: (id) => api.get(`${BASE}/activities/${id}`),

  triggerBackfill: () => api.post(`${BASE}/backfill`),
}

export default overviewApi
