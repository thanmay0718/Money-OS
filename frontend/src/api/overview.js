// src/api/overview.js
import api from './axios'

const BASE = '/api/overview'

export const overviewApi = {
  getSummary: (params = {}) => api.get(`${BASE}/summary`, { params }),

  getHeatmap: (params = {}) => api.get(`${BASE}/heatmap`, { params }),

  getActivities: (params = {}) => api.get(`${BASE}/activities`, { params }),

  getActivityDetail: (id) => api.get(`${BASE}/activities/${id}`),

  getGamification: () => api.get(`${BASE}/gamification`, { timeout: 20000 }),

  evaluateAchievements: () => api.post(`${BASE}/achievements/evaluate`),

  triggerBackfill: () => api.post(`${BASE}/backfill`),

  getRewards: () => api.get(`${BASE}/rewards`),

  redeemReward: (rewardCode) => api.post(`${BASE}/rewards/redeem`, { rewardCode }),
}

export default overviewApi
