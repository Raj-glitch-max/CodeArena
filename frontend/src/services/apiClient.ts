import axios from 'axios'
import { API_BASE_URL } from '../config/env'

export const apiClient = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || 'dev'
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
