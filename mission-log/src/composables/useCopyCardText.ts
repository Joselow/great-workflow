import apiApp from '@/utils/axios/apiApp'

import { ref } from 'vue'

import { errorToast, successToast } from '@/composables/useAlerts'

import { cardToCopyText } from '@/helpers/cardCopyText'
import { copyText } from '@/utils/copyText'

import type { Card, CardDraft } from '@/interfaces/card'

type CardCopySource = Pick<CardDraft, 'name' | 'description' | 'isPrompt' | 'sections'>

export function useCopyCardText() {
  const copied = ref(false)
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  const markCopied = () => {
    copied.value = true

    if (resetTimer) clearTimeout(resetTimer)

    resetTimer = setTimeout(() => {
      copied.value = false
    }, 3000)
  }

  const copyFromCard = async (card: CardCopySource): Promise<boolean> => {
    const success = await copyText(cardToCopyText(card))

    if (success) {
      markCopied()
      successToast('Texto copiado')
      return true
    }

    copied.value = false
    errorToast('No se pudo copiar')
    return false
  }

  const copyCardById = async (id: string): Promise<boolean> => {
    try {
      const { data } = await apiApp.get<Card>(`/card/${id}`)
      return copyFromCard(data)
    } catch {
      return false
    }
  }

  return {
    copied,
    copyFromCard,
    copyCardById,
  }
}
