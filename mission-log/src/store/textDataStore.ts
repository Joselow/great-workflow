import { ref } from 'vue'

const textData = ref<string>('')

export const useTextDataStore = () => {
  const setTextData = (value: string) => {
    textData.value = value
  }

  const clearTextData = () => {
    textData.value = ''
  }

  return {
    textData,
    setTextData,
    clearTextData,
  }
}

export const textDataStore = useTextDataStore()
