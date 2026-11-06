// src/api/ai.js
import api from './axios'

export const aiApi = {
  getInsights: () => api.get('/api/ai/insights'),
  getCashflowForecast: () => api.get('/api/ai/cashflow-forecast'),
  getBudgetRecommendations: () => api.get('/api/ai/budget-recommendations'),
  askCopilot: (message) => api.post('/api/ai/ask', { message }),
}

export default aiApi
