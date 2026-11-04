// src/features/budget/budgetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (month, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/budgets', {
        params: month ? { month } : {},
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load budgets')
    }
  }
)

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/budgets', payload)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create budget')
    }
  }
)

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/budgets/${id}`, data)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update budget')
    }
  }
)

export const deleteBudget = createAsyncThunk(
  'budget/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/budgets/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete budget')
    }
  }
)

const initialState = {
  list: [],
  status: 'idle',
  error: null,
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudgets: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      // Fetch
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload || []
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      // Create
      .addCase(createBudget.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })

      // Update
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
      })

      // Delete
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b.id !== action.payload)
      })
  },
})

export const { clearBudgets } = budgetSlice.actions
export default budgetSlice.reducer
