import { ref } from 'vue'
import type { Log } from '@/interfaces/Log'

const selectedLog = ref<Log | null>(null)

export const useLogStore = () => {
  const selectLog = (logData: Log) => {
    console.log('new log', logData);
    
    selectedLog.value = logData
  }

  const clearLog = () => {
    selectedLog.value = null
  }

  return {
    selectedLog,
    selectLog,
    clearLog,
  }
}

export const logStore = useLogStore()
