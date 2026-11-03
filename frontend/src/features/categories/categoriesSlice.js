// src/features/categories/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (type, { rejectWithValue }) => {
    try {
      const params = type ? { type } : {}
      const response = await api.get('/api/categories', { params })
      return response.data // array of CategoryResponse
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load categories'
      return rejectWithValue(message)
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ name, type }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/categories', {
        name: name.trim(),
        type,
      })
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create category'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Reset categories on user logout or login
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
  },
})

export const { clearCategories } = categoriesSlice.actions
export default categoriesSlice.reducer
