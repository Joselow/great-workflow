import axios from 'axios'

import { getAuthToken } from './cookies'
import { handleErrorRequest } from '@/helpers/handleErrorRequest'

export const API_BASE_URL = import.meta.env.VITE_NOTES_API_URL

export const createApi = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      handleErrorRequest(error)
      return Promise.reject(error)
    }
  )

  return instance
}

export const api = createApi(API_BASE_URL)

export const appApi = createApi(`${API_BASE_URL}/app`)

export default api