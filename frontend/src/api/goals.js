import api from './axios';

export const fetchGoals = () => api.get('/api/goals');
export const createGoal = (payload) => api.post('/api/goals', payload);
export const addGoalContribution = (goalId, payload) => api.post(`/api/goals/${goalId}/contributions`, payload);
export const fetchGoalContributions = (goalId, params) => api.get(`/api/goals/${goalId}/contributions`, { params });
