// src/features/dashboard/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchDashboardInsights = createAsyncThunk(
  'dashboard/fetchInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/profile/financial')
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load financial insights'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  profile: null,
  budgetSuggestion: null,
  goalProgress: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Reset on logout or new login
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      .addCase(fetchDashboardInsights.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboardInsights.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
        state.budgetSuggestion = action.payload?.budgetSuggestion || null
        state.goalProgress = action.payload?.goalProgress || []
        state.error = null
      })
      .addCase(fetchDashboardInsights.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load financial insights'
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
