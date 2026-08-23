import axios from 'axios'

import { getAuthToken } from '../cookies'
import { handleErrorRequest } from '@/helpers/handleErrorRequest'


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