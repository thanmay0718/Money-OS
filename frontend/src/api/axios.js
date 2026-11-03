// src/api/axios.js
import axios from 'axios'
import { toast } from '../lib/toast'

// Use configurable API base URL, defaulting to relative for Vite proxy
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercept responses to handle 401 / 403 cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname
      // Clear invalid credentials
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Only redirect if not already on public auth pages to avoid redirect loops
      const publicPaths = ['/login', '/register', '/welcome', '/oauth/callback']
      if (!publicPaths.includes(currentPath)) {
        toast.error('Your session has expired. Please sign in again.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
