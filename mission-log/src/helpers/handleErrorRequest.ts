import { deleteAuthToken } from "@/utils/cookies"

import { errorToast } from '@/composables/useAlerts';
import { formatErrorsToHtml } from './formatValidationsErrors';

import type { ApiResponseError } from '@/interfaces/request';


const actions = {
  401: (msg: string = '') => {
    deleteAuthToken()
    errorToast(msg || 'Acceso denegado', null)
  },
  403: (msg: string = '') => {
    errorToast(msg || 'Acceso denegado', null)
  },
  404: (msg: string = '') => {
    errorToast(msg || 'No encontrado', null)
  },
  500: (msg: string = '') => {
    errorToast(msg || 'Error interno del servidor', null)
  },
  400: (msg: string = '') => {
    errorToast(msg || 'Ocurrió un error', null)
  },
}

export const handleErrorRequest = (error?: any): void => {
  console.log(error);
  
  let defaultMessage =  'Ocurrio un error inesperado, recarga la página porfavor'

  if  (!error) {
    errorToast(defaultMessage)
    return
  }

  const status = error.status as keyof typeof actions

  if (!actions[status]) {
    errorToast(error.response?.data?.message ?? defaultMessage)
    return
  }

  const errorData = error.response?.data as ApiResponseError

  if (errorData.errors && (typeof errorData.errors != 'string')) {
    actions[status](formatErrorsToHtml(errorData.errors))
  } else {
    actions[status](error.response?.data?.message)
  }
};