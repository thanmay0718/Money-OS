// src/features/transactions/transactionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const extractItems = (data) => (data && data.content ? data.content : Array.isArray(data) ? data : [])

export const fetchRecentTransactions = createAsyncThunk(
  'transactions/fetchRecent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/transactions', {
        params: { page: 0, size: 10, sort: 'createdAt,desc' },
      })
      return extractItems(response.data)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load transactions'
      return rejectWithValue(message)
    }
  }
)

export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/transactions', {
        params: { page: 0, size: 100, sort: 'createdAt,desc' },
      })
      return extractItems(response.data)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load transactions'
      return rejectWithValue(message)
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transactions', payload)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create transaction'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Reset transactions on user logout or login
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      // Recent
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      // All
      .addCase(fetchAllTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      // Create
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
  },
})

export const { clearTransactions } = transactionsSlice.actions
export default transactionsSlice.reducer
