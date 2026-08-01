import { ref, type Ref } from 'vue'
import api from '@/utils/axios.ts'

import type { NewLog, Log, PartialLog } from '@/interfaces/Log'
import type { ResponseComposables } from '@/interfaces/request'


import { successToast } from './useAlerts';


export function useLog() {
  const loading = ref(false)
  const logs: Ref<Log[]> = ref([])

  const getLogs = async () => {
    loading.value = true

    try {
      const { data } = await api.get('/log')
      console.log(data);
      logs.value = data
      return {
        success: true,
        data
      }
    } catch (err: any) { 
        return {
            success: false,
        }
    } finally {
      loading.value = false
    }
    
  }

  const createLog = async (log: NewLog ): Promise<ResponseComposables<Log>> => {
    loading.value = true

    try {
      const { data: data } = await api.post('/log', log)


      successToast('Created Successfully')

      return {
        success: true,
        data: data 
      }
    } catch (err: any) { 
        return {
            success: false,
        }
    } finally {
      loading.value = false
    }
  }

  const updateLog = async (id: Log['id'], log: PartialLog): Promise<ResponseComposables<Log>> => {
    loading .value =  true
    try {

      const { data } = await api.put('/log/'+id, log)

      successToast('Updated Successfully')

      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
      }
    } finally {
      loading .value =  false
    }
  }

  const deleteLog = async (id: Log['id']): Promise<ResponseComposables<null>> => {
    loading.value = true

    try {
      await api.delete('/log/'+id)

      successToast('Deleted Successfully')

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
      }
    } finally {
      loading.value = false
    }
  }


  return {
    loading,
    getLogs,
    logs,
    createLog,
    updateLog,
    deleteLog,
  }
}
