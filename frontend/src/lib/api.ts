import axios from 'axios'

/**
 * Shared axios instance. Relative baseURL so requests go through the Vite proxy
 * in dev and Nginx in production — no environment-specific host anywhere.
 *
 * The JWT request interceptor and 401-refresh response interceptor attach here
 * in Phase 1.
 */
export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

/** Endpoints outside the versioned API namespace (health checks, etc.). */
export const rootApi = axios.create({ baseURL: '/' })
