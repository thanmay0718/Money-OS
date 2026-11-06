// src/features/ai/aiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { aiApi } from '../../api/ai'

export const fetchAiInsights = createAsyncThunk(
  'ai/fetchInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiApi.getInsights()
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch AI insights'
      return rejectWithValue(message)
    }
  }
)

export const fetchCashflowForecast = createAsyncThunk(
  'ai/fetchCashflowForecast',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiApi.getCashflowForecast()
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch cashflow forecast'
      return rejectWithValue(message)
    }
  }
)

export const fetchBudgetRecommendations = createAsyncThunk(
  'ai/fetchBudgetRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiApi.getBudgetRecommendations()
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch budget recommendations'
      return rejectWithValue(message)
    }
  }
)

export const askCopilotMessage = createAsyncThunk(
  'ai/askCopilot',
  async (message, { rejectWithValue }) => {
    try {
      const response = await aiApi.askCopilot(message)
      return { question: message, ...response.data }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to get copilot response'
      return rejectWithValue(msg)
    }
  }
)

const initialState = {
  insights: [],
  insightsStatus: 'idle',
  insightsError: null,

  forecast: null,
  forecastStatus: 'idle',
  forecastError: null,

  recommendations: [],
  recommendationsStatus: 'idle',
  recommendationsError: null,

  chatHistory: [],
  chatStatus: 'idle',
  chatError: null,

  dismissedInsightIds: [],
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    dismissInsight: (state, action) => {
      state.dismissedInsightIds.push(action.payload)
    },
    clearDismissedInsights: (state) => {
      state.dismissedInsightIds = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Insights
      .addCase(fetchAiInsights.pending, (state) => {
        state.insightsStatus = 'loading'
        state.insightsError = null
      })
      .addCase(fetchAiInsights.fulfilled, (state, action) => {
        state.insightsStatus = 'succeeded'
        state.insights = action.payload || []
      })
      .addCase(fetchAiInsights.rejected, (state, action) => {
        state.insightsStatus = 'failed'
        state.insightsError = action.payload
      })

      // Forecast
      .addCase(fetchCashflowForecast.pending, (state) => {
        state.forecastStatus = 'loading'
        state.forecastError = null
      })
      .addCase(fetchCashflowForecast.fulfilled, (state, action) => {
        state.forecastStatus = 'succeeded'
        state.forecast = action.payload || null
      })
      .addCase(fetchCashflowForecast.rejected, (state, action) => {
        state.forecastStatus = 'failed'
        state.forecastError = action.payload
      })

      // Budget Recommendations
      .addCase(fetchBudgetRecommendations.pending, (state) => {
        state.recommendationsStatus = 'loading'
        state.recommendationsError = null
      })
      .addCase(fetchBudgetRecommendations.fulfilled, (state, action) => {
        state.recommendationsStatus = 'succeeded'
        state.recommendations = action.payload || []
      })
      .addCase(fetchBudgetRecommendations.rejected, (state, action) => {
        state.recommendationsStatus = 'failed'
        state.recommendationsError = action.payload
      })

      // Copilot Chat
      .addCase(askCopilotMessage.pending, (state) => {
        state.chatStatus = 'loading'
        state.chatError = null
      })
      .addCase(askCopilotMessage.fulfilled, (state, action) => {
        state.chatStatus = 'succeeded'
        state.chatHistory.push(action.payload)
      })
      .addCase(askCopilotMessage.rejected, (state, action) => {
        state.chatStatus = 'failed'
        state.chatError = action.payload
      })
  },
})

export const { dismissInsight, clearDismissedInsights } = aiSlice.actions
export default aiSlice.reducer
