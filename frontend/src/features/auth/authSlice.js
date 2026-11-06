// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

// ---------------------------------------------------
// Helper to get saved user safely from localStorage
// ---------------------------------------------------
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------
// Async thunks
// ---------------------------------------------------
export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password, currency }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/users/register', {
        fullName: fullName?.trim(),
        email: email?.trim(),
        password,
        currency: currency || 'INR',
      })
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', {
        email: email?.trim(),
        password,
      })
      // Backend AuthResponse: { accessToken, tokenType, expiresIn, user }
      const token = response.data?.accessToken || response.data?.token
      const user = response.data?.user
      if (!token) {
        return rejectWithValue('No access token received from server')
      }
      localStorage.setItem('token', token)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return { token, user }
    } catch (err) {
      const message = err.response
        ? 'Please check your email address and password, then try again.'
        : 'We couldn’t reach the sign-in service. Please try again in a moment.'
      return rejectWithValue(message)
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me')
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch current user'
      return rejectWithValue(message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Even if server revocation fails, clear local credentials
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return {}
  }
)

// ---------------------------------------------------
// Slice definition
// ---------------------------------------------------
const tokenFromStorage = localStorage.getItem('token')
// Verify token is not a literal string "undefined" or "null"
const validInitialToken =
  tokenFromStorage && tokenFromStorage !== 'undefined' && tokenFromStorage !== 'null'
    ? tokenFromStorage
    : null

if (!validInitialToken && tokenFromStorage) {
  localStorage.removeItem('token')
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    token: validInitialToken,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    registerSuccess: false,
    sessionRestored: !validInitialToken, // immediately true if no initial token to validate
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    resetRegisterSuccess: (state) => {
      state.registerSuccess = false
    },
    completeOAuthLogin: (state, action) => {
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      state.token = action.payload.token
      state.user = action.payload.user
      state.status = 'succeeded'
      state.sessionRestored = true
      state.error = null
    },
    forceLogout: (state) => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      state.token = null
      state.user = null
      state.status = 'idle'
      state.sessionRestored = true
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.registerSuccess = false
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded'
        state.registerSuccess = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
        state.registerSuccess = false
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        state.sessionRestored = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Invalid email or password'
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
        state.sessionRestored = true
        state.error = null
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.sessionRestored = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.sessionRestored = true
      })
  },
})

export const {
  clearAuthError,
  resetRegisterSuccess,
  forceLogout,
  completeOAuthLogin,
} = authSlice.actions
export default authSlice.reducer
