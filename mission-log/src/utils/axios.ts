import axios from 'axios'

import { getAuthToken, deleteAuthToken } from '../utils/cookies'

const API_BASE_URL = import.meta.env.VITE_NOTES_API_URL || 'http://localhost:3000'

export const api = axios.create({
    baseURL: `${API_BASE_URL}`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  api.interceptors.request.use(
    (config) => {
      const token = getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  api.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      if (error.response?.status === 401) {
        deleteAuthToken()
        // window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
  
  export default api