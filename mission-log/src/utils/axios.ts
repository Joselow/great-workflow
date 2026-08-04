import axios from 'axios'

import { getAuthToken } from '../utils/cookies'
import { handleErrorRequest } from '@/helpers/handleErrorRequest'

const API_BASE_URL = import.meta.env.VITE_NOTES_API_URL

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
    handleErrorRequest(error)
    return Promise.reject(error)
  }
)

export default api