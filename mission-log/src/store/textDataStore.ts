import { ref } from 'vue'

export type TextDataFormat = 'plain' | 'markdown'

const textData = ref<string>('')
const format = ref<TextDataFormat>('plain')
const expanded = ref(false)

export const useTextDataStore = () => {
  const setTextData = (value: string, nextFormat: TextDataFormat = 'plain') => {
    textData.value = value
    format.value = nextFormat
    if (value) expanded.value = true
  }

  const appendTextData = (value: string, nextFormat: TextDataFormat = 'plain') => {
    textData.value = textData.value ? `${textData.value}\n\n---\n\n${value}` : value
    format.value = nextFormat
    if (value) expanded.value = true
  }

  const clearTextData = () => {
    textData.value = ''
    format.value = 'plain'
  }

  const toggleExpanded = () => {
    expanded.value = !expanded.value
  }

  return {
    textData,
    format,
    expanded,
    setTextData,
    appendTextData,
    clearTextData,
    toggleExpanded,
  }
}

export const textDataStore = useTextDataStore()
