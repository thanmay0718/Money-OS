// src/features/networth/netWorthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchNetWorth = createAsyncThunk(
  'networth/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/net-worth')
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load net worth')
    }
  }
)

export const addNetWorthItem = createAsyncThunk(
  'networth/addItem',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/net-worth/items', payload)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to add item')
    }
  }
)

export const deleteNetWorthItem = createAsyncThunk(
  'networth/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/net-worth/items/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete item')
    }
  }
)

const initialState = {
  summary: null,
  status: 'idle',
  error: null,
}

const netWorthSlice = createSlice({
  name: 'networth',
  initialState,
  reducers: {
    clearNetWorth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      // Fetch
      .addCase(fetchNetWorth.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNetWorth.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.summary = action.payload
      })
      .addCase(fetchNetWorth.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearNetWorth } = netWorthSlice.actions
export default netWorthSlice.reducer
