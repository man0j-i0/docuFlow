import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setAuthFailureHandler } from '@/lib/api'
import { tokenStore } from '@/lib/tokens'
import { credentialsReceived, loggedOut, userLoaded } from './authSlice'
import { fetchMe, login as loginRequest, logout as logoutRequest } from './api'
import type { LoginRequest } from './types'


export function useAuth() {
  return useAppSelector((state) => state.auth)
}


export function useAuthBootstrap() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    setAuthFailureHandler(() => dispatch(loggedOut()))
  }, [dispatch])

  useEffect(() => {
    if (!tokenStore.getAccess()) return
    fetchMe()
      .then((user) => dispatch(userLoaded(user)))
      .catch(() => dispatch(loggedOut()))
  }, [dispatch])
}

export function useLogin() {
  const dispatch = useAppDispatch()

  return async (payload: LoginRequest) => {
    const data = await loginRequest(payload)
    dispatch(credentialsReceived(data))
    return data
  }
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return async () => {
    await logoutRequest()
    dispatch(loggedOut())
    navigate('/login', { replace: true })
  }
}
