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

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/profile/dashboard-summary')
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load dashboard summary'
      return rejectWithValue(message)
    }
  }
)

export const fetchEmergencyFund = createAsyncThunk(
  'dashboard/fetchEmergencyFund',
  async (targetMonths, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/profile/emergency-fund', {
        params: targetMonths ? { targetMonths } : {},
      })
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load emergency fund data'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  profile: null,
  budgetSuggestion: null,
  goalProgress: [],
  summary: null,
  emergencyFund: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  summaryStatus: 'idle',
  emergencyStatus: 'idle',
  error: null,
  summaryError: null,
  emergencyError: null,
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

      // Dashboard Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.summaryStatus = 'loading'
        state.summaryError = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded'
        state.summary = action.payload
        state.summaryError = null
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed'
        state.summaryError = action.payload || 'Failed to load dashboard summary'
      })

      // Emergency Fund
      .addCase(fetchEmergencyFund.pending, (state) => {
        state.emergencyStatus = 'loading'
        state.emergencyError = null
      })
      .addCase(fetchEmergencyFund.fulfilled, (state, action) => {
        state.emergencyStatus = 'succeeded'
        state.emergencyFund = action.payload
        state.emergencyError = null
      })
      .addCase(fetchEmergencyFund.rejected, (state, action) => {
        state.emergencyStatus = 'failed'
        state.emergencyError = action.payload || 'Failed to load emergency fund data'
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
