// src/features/overview/overviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { overviewApi } from '../../api/overview'

export const fetchOverviewSummary = createAsyncThunk(
  'overview/fetchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await overviewApi.getSummary(params)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load overview summary'
      return rejectWithValue(message)
    }
  }
)

export const fetchHeatmap = createAsyncThunk(
  'overview/fetchHeatmap',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await overviewApi.getHeatmap(params)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load heatmap data'
      return rejectWithValue(message)
    }
  }
)

export const fetchActivities = createAsyncThunk(
  'overview/fetchActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await overviewApi.getActivities(params)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load activities'
      return rejectWithValue(message)
    }
  }
)

export const fetchMoreActivities = createAsyncThunk(
  'overview/fetchMoreActivities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await overviewApi.getActivities(params)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load more activities'
      return rejectWithValue(message)
    }
  }
)

export const fetchActivityDetail = createAsyncThunk(
  'overview/fetchActivityDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await overviewApi.getActivityDetail(id)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load activity details'
      return rejectWithValue(message)
    }
  }
)

export const triggerBackfill = createAsyncThunk(
  'overview/triggerBackfill',
  async (_, { rejectWithValue }) => {
    try {
      await overviewApi.triggerBackfill()
      return true
    } catch (err) {
      return rejectWithValue('Backfill skipped or failed')
    }
  }
)

const initialState = {
  summary: null,
  summaryStatus: 'idle', // idle | loading | succeeded | failed
  summaryError: null,

  heatmap: [],
  heatmapStatus: 'idle',
  heatmapError: null,

  activities: [],
  activitiesPage: {
    number: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
  activitiesStatus: 'idle',
  activitiesError: null,

  loadingMore: false,

  selectedActivity: null,
  selectedActivityStatus: 'idle',

  filters: {
    dateRange: 'last12months', // 'last30days' | 'last6months' | 'last12months'
    startDate: null,
    endDate: null,
    types: null,
    search: '',
  },

  selectedDate: null, // 'YYYY-MM-DD' from heatmap click
}

const overviewSlice = createSlice({
  name: 'overview',
  initialState,
  reducers: {
    setFilterDateRange: (state, action) => {
      state.filters.dateRange = action.payload
    },
    setFilterDates: (state, action) => {
      state.filters.startDate = action.payload.startDate
      state.filters.endDate = action.payload.endDate
    },
    setFilterTypes: (state, action) => {
      state.filters.types = action.payload
    },
    setFilterSearch: (state, action) => {
      state.filters.search = action.payload
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload
    },
    clearSelectedDate: (state) => {
      state.selectedDate = null
    },
    clearSelectedActivity: (state) => {
      state.selectedActivity = null
    },
    resetFilters: (state) => {
      state.filters = {
        dateRange: 'last12months',
        startDate: null,
        endDate: null,
        types: null,
        search: '',
      }
      state.selectedDate = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchOverviewSummary.pending, (state) => {
        state.summaryStatus = 'loading'
        state.summaryError = null
      })
      .addCase(fetchOverviewSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded'
        state.summary = action.payload
      })
      .addCase(fetchOverviewSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed'
        state.summaryError = action.payload
      })

      // Heatmap
      .addCase(fetchHeatmap.pending, (state) => {
        state.heatmapStatus = 'loading'
        state.heatmapError = null
      })
      .addCase(fetchHeatmap.fulfilled, (state, action) => {
        state.heatmapStatus = 'succeeded'
        state.heatmap = action.payload || []
      })
      .addCase(fetchHeatmap.rejected, (state, action) => {
        state.heatmapStatus = 'failed'
        state.heatmapError = action.payload
      })

      // Activities
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesStatus = 'loading'
        state.activitiesError = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activitiesStatus = 'succeeded'
        state.activities = action.payload.content || []
        state.activitiesPage = {
          number: action.payload.number ?? 0,
          size: action.payload.size ?? 20,
          totalElements: action.payload.totalElements ?? 0,
          totalPages: action.payload.totalPages ?? 0,
          last: action.payload.last ?? true,
        }
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesStatus = 'failed'
        state.activitiesError = action.payload
      })

      // More Activities (Pagination)
      .addCase(fetchMoreActivities.pending, (state) => {
        state.loadingMore = true
      })
      .addCase(fetchMoreActivities.fulfilled, (state, action) => {
        state.loadingMore = false
        const newItems = action.payload.content || []
        // Deduplicate by ID
        const existingIds = new Set(state.activities.map((a) => a.id))
        const filteredNew = newItems.filter((a) => !existingIds.has(a.id))
        state.activities = [...state.activities, ...filteredNew]
        state.activitiesPage = {
          number: action.payload.number ?? 0,
          size: action.payload.size ?? 20,
          totalElements: action.payload.totalElements ?? 0,
          totalPages: action.payload.totalPages ?? 0,
          last: action.payload.last ?? true,
        }
      })
      .addCase(fetchMoreActivities.rejected, (state) => {
        state.loadingMore = false
      })

      // Activity Detail
      .addCase(fetchActivityDetail.pending, (state) => {
        state.selectedActivityStatus = 'loading'
      })
      .addCase(fetchActivityDetail.fulfilled, (state, action) => {
        state.selectedActivityStatus = 'succeeded'
        state.selectedActivity = action.payload
      })
      .addCase(fetchActivityDetail.rejected, (state) => {
        state.selectedActivityStatus = 'failed'
      })
  },
})

export const {
  setFilterDateRange,
  setFilterDates,
  setFilterTypes,
  setFilterSearch,
  setSelectedDate,
  clearSelectedDate,
  clearSelectedActivity,
  resetFilters,
} = overviewSlice.actions

export default overviewSlice.reducer
