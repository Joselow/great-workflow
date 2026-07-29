import { ref, type Ref } from 'vue'
import api from '@/utils/axios.ts'

import type { NewLog, Log } from '@/interfaces/Log'
import type { ResponseComposables } from '@/interfaces/request'

import { useToast } from '@/composables/useToast';

const { launchToast } = useToast()

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
  const createLog = async (log: NewLog ): Promise<ResponseComposables<NewLog>> => {
    loading.value = true

    try {
      const { data } = await api.post('/log', log)
      console.log(data);

      launchToast({ 
        msg: 'Created Succesfully',
        time: 5000,
        css: 'bg-green-500'
       })

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


  return {
    loading,
    getLogs,
    logs,
    createLog
  }
}
