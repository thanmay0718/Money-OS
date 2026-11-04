// src/features/recurring/recurringSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import { fetchBudgets } from '../budget/budgetSlice'

export const fetchRecurring = createAsyncThunk(
  'recurring/fetchRecurring',
  async (billsOnly, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/recurring', {
        params: billsOnly != null ? { billsOnly } : {},
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load recurring commitments')
    }
  }
)

export const createRecurring = createAsyncThunk(
  'recurring/createRecurring',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/recurring', payload)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create recurring commitment')
    }
  }
)

export const updateRecurring = createAsyncThunk(
  'recurring/updateRecurring',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/recurring/${id}`, data)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update recurring commitment')
    }
  }
)

export const deleteRecurring = createAsyncThunk(
  'recurring/deleteRecurring',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/recurring/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete recurring commitment')
    }
  }
)

export const payRecurring = createAsyncThunk(
  'recurring/payRecurring',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/api/recurring/${id}/pay`)
      dispatch(fetchBudgets(new Date().toISOString().slice(0, 7)))
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to settle bill')
    }
  }
)

const initialState = {
  list: [],
  status: 'idle',
  error: null,
}

const recurringSlice = createSlice({
  name: 'recurring',
  initialState,
  reducers: {
    clearRecurring: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      // Fetch
      .addCase(fetchRecurring.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRecurring.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload || []
      })
      .addCase(fetchRecurring.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      // Create
      .addCase(createRecurring.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })

      // Update
      .addCase(updateRecurring.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
      })

      // Pay
      .addCase(payRecurring.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
      })

      // Delete
      .addCase(deleteRecurring.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload)
      })
  },
})

export const { clearRecurring } = recurringSlice.actions
export default recurringSlice.reducer
