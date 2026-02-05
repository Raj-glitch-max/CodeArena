import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Create axios instance with defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request queue for offline support
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID()

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and retries
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number }

    // Handle 401 - unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = 1
      isRefreshing = true

      try {
        // Try to refresh token (implement when backend supports it)
        // const { data } = await api.post('/api/v1/auth/refresh')
        // localStorage.setItem('access_token', data.access_token)
        // processQueue()
        // return api(originalRequest)

        // For now, just clear token and redirect to login
        localStorage.removeItem('access_token')
        processQueue(error)
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
        return Promise.reject(error)
      } catch (refreshError) {
        processQueue(error)
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Show user-friendly error toast
    const axiosError = error as AxiosError<ApiResponse<unknown>>
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      (axiosError.message === 'Network Error' ? 'Network error. Please check your connection.' : null) ||
      (axiosError.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      'An unexpected error occurred'

    // Only show toast for non-401 errors (401 shows custom message above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage)
    }

    // Retry logic for network errors and 5xx errors
    const retryCount = originalRequest._retry ?? 0
    const shouldRetry = (
      retryCount < MAX_RETRIES &&
      (!error.response || error.response.status >= 500) &&
      originalRequest.method !== 'post' // Don't retry POST requests
    )

    if (shouldRetry) {
      originalRequest._retry = retryCount + 1
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

// Typed API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Helper functions for common operations
export const apiHelpers = {
  // GET request with typed response
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, { params })
    return response.data.data
  },

  // POST request with typed response
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data)
    return response.data.data
  },

  // PUT request with typed response
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data)
    return response.data.data
  },

  // DELETE request with typed response
  async delete<T>(url: string): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url)
    return response.data.data
  },
}

// Error handling utility
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error
    }
    if (axiosError.message === 'Network Error') {
      return 'Unable to connect. Please check your internet connection.'
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.'
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}