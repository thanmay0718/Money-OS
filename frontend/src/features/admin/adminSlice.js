// src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

// ---------------------------------------------------
// Async Thunks
// ---------------------------------------------------
export const fetchAdminOverview = createAsyncThunk(
  'admin/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/overview')
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch admin overview'
      )
    }
  }
)

export const fetchAdminAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/analytics', { params: { days } })
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch analytics'
      )
    }
  }
)

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ query = '', role = '', page = 0, size = 15 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size }
      if (query && query.trim()) params.query = query.trim()
      if (role && role !== 'ALL') params.role = role
      try {
        const response = await api.get('/api/admin/users', { params })
        return response.data
      } catch (err) {
        if (err.response?.status === 404) {
          const fallback = await api.get('/api/users', { params })
          return fallback.data
        }
        throw err
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch users'
      )
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${id}/role`, { role })
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update user role'
      )
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, active }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${id}/status`, { active })
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update user status'
      )
    }
  }
)

export const fetchAdminCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/categories')
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch categories'
      )
    }
  }
)

export const fetchAdminAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async ({ page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/audit-logs', { params: { page, size } })
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch audit logs'
      )
    }
  }
)

export const fetchSystemHealth = createAsyncThunk(
  'admin/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/system-health')
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch system health'
      )
    }
  }
)

// ---------------------------------------------------
// Slice Definition
// ---------------------------------------------------
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    overview: null,
    overviewStatus: 'idle',
    overviewError: null,

    analytics: null,
    analyticsStatus: 'idle',
    analyticsError: null,

    usersPage: null,
    usersStatus: 'idle',
    usersError: null,

    categories: [],
    categoriesStatus: 'idle',
    categoriesError: null,

    auditLogsPage: null,
    auditLogsStatus: 'idle',
    auditLogsError: null,

    health: null,
    healthStatus: 'idle',
    healthError: null,

    actionStatus: 'idle',
    actionError: null,
  },
  reducers: {
    clearActionError: (state) => {
      state.actionError = null
      state.actionStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchAdminOverview.pending, (state) => {
        state.overviewStatus = 'loading'
        state.overviewError = null
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.overviewStatus = 'succeeded'
        state.overview = action.payload
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.overviewStatus = 'failed'
        state.overviewError = action.payload
      })

      // Analytics
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading'
        state.analyticsError = null
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = 'succeeded'
        state.analytics = action.payload
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.analyticsStatus = 'failed'
        state.analyticsError = action.payload
      })

      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = 'loading'
        state.usersError = null
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded'
        state.usersPage = action.payload
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersStatus = 'failed'
        state.usersError = action.payload
      })

      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        if (state.usersPage && state.usersPage.content) {
          state.usersPage.content = state.usersPage.content.map((u) =>
            u.id === action.payload.id ? { ...u, role: action.payload.role } : u
          )
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.payload
      })

      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        if (state.usersPage && state.usersPage.content) {
          state.usersPage.content = state.usersPage.content.map((u) =>
            u.id === action.payload.id ? { ...u, deletedAt: action.payload.deletedAt } : u
          )
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.payload
      })

      // Categories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
        state.categoriesError = null
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed'
        state.categoriesError = action.payload
      })

      // Audit Logs
      .addCase(fetchAdminAuditLogs.pending, (state) => {
        state.auditLogsStatus = 'loading'
        state.auditLogsError = null
      })
      .addCase(fetchAdminAuditLogs.fulfilled, (state, action) => {
        state.auditLogsStatus = 'succeeded'
        state.auditLogsPage = action.payload
      })
      .addCase(fetchAdminAuditLogs.rejected, (state, action) => {
        state.auditLogsStatus = 'failed'
        state.auditLogsError = action.payload
      })

      // System Health
      .addCase(fetchSystemHealth.pending, (state) => {
        state.healthStatus = 'loading'
        state.healthError = null
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.healthStatus = 'succeeded'
        state.health = action.payload
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.healthStatus = 'failed'
        state.healthError = action.payload
      })
  },
})

export const { clearActionError } = adminSlice.actions
export default adminSlice.reducer
