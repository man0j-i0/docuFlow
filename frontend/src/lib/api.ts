import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from './tokens'


export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json'},
})

export const rootApi = axios.create({ baseURL: '/' })

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let waiters: Array<(token: string | null) => void> = []

function notifyWaiters(token: string | null) {
  waiters.forEach((resolve) => resolve(token))
  waiters = []
}

let onAuthFailure: () => void = () => {}
export function setAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry){
      return Promise.reject(error)
    }

    const refresh = tokenStore.getRefresh()
    if(!refresh) {
      onAuthFailure()
      return Promise.reject(error)
    }

    original._retry = true

    if(isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((token) => {
          if(!token) return reject(error)
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post('/api/v1/auth/refresh', { refresh })
      tokenStore.set(data.access, data.refresh ?? refresh)

      notifyWaiters(data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return api(original) 
    } catch (refreshError) {
      notifyWaiters(null)
      tokenStore.clear()
      onAuthFailure()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
