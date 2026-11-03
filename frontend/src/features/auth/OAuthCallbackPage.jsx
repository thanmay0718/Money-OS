import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { completeOAuthLogin, clearAuthError } from './authSlice'

export default function OAuthCallbackPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [statusMessage, setStatusMessage] = useState('Completing secure sign-in…')

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(
      location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
    )

    // Check for error from backend
    const oauthError = searchParams.get('oauthError') || hashParams.get('oauthError')
    if (oauthError) {
      dispatch(clearAuthError())
      navigate(`/login?oauthError=${encodeURIComponent(oauthError)}`, { replace: true })
      return
    }

    // 1. Primary secure code exchange flow (query param: ?code=...)
    const code = searchParams.get('code')
    if (code) {
      setStatusMessage('Exchanging authorization code for MoneyOS session…')
      api.post('/api/auth/oauth/exchange', { code })
        .then(({ data }) => {
          const { accessToken, user } = data
          if (!accessToken) {
            throw new Error('No access token received from server')
          }
          dispatch(completeOAuthLogin({ token: accessToken, user }))
          navigate('/', { replace: true })
        })
        .catch((err) => {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'OAuth authentication code exchange failed'
          dispatch(clearAuthError())
          navigate(`/login?oauthError=${encodeURIComponent(message)}`, { replace: true })
        })
      return
    }

    // 2. Fallback to direct token in hash (#accessToken=...)
    const token = hashParams.get('accessToken')
    if (token) {
      setStatusMessage('Validating session profile…')
      localStorage.setItem('token', token)
      api.get('/api/auth/me')
        .then(({ data }) => {
          dispatch(completeOAuthLogin({ token, user: data }))
          navigate('/', { replace: true })
        })
        .catch(() => {
          localStorage.removeItem('token')
          navigate('/login?oauthError=' + encodeURIComponent('Failed to retrieve user profile'), { replace: true })
        })
      return
    }

    // Neither code nor token found
    dispatch(clearAuthError())
    navigate('/login?oauthError=' + encodeURIComponent('No authorization code received from provider'), { replace: true })
  }, [dispatch, navigate, location])

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-8 h-8 border-4 border-primaryAccent border-t-transparent rounded-full animate-spin" />
      <div className="text-secondaryText font-medium text-sm">
        {statusMessage}
      </div>
    </div>
  )
}
