// src/features/pockets/pocketsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

// ------------------------------------------------------------------
// Async thunks
// ------------------------------------------------------------------
export const fetchPockets = createAsyncThunk(
  'pockets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/pockets')
      return response.data // array of MoneyPocketResponse
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)

export const createPocket = createAsyncThunk(
  'pockets/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/pockets', payload)
      return response.data // new pocket
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)

// ------------------------------------------------------------------
// Slice definition
// ------------------------------------------------------------------
const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const pocketsSlice = createSlice({
  name: 'pockets',
  initialState,
  reducers: {
    clearPockets: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Reset pockets on user logout or login
      .addCase('auth/logout/fulfilled', () => initialState)
      .addCase('auth/forceLogout', () => initialState)
      .addCase('auth/login/fulfilled', () => initialState)

      .addCase(fetchPockets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPockets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchPockets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(createPocket.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createPocket.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createPocket.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export const { clearPockets } = pocketsSlice.actions
export default pocketsSlice.reducer
