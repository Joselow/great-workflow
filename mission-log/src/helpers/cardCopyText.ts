import type { CardDraft } from '@/interfaces/card'

const block = (title: string, body: string) => `${title}\n${body}`

export function cardToCopyText(
  card: Pick<CardDraft, 'name' | 'description' | 'isPrompt' | 'sections'>
): string {
  const parts = [block(card.name, card.description)]

  if (!card.isPrompt) {
    for (const section of card.sections) {
      if (!section.title.trim() && !section.description.trim()) continue
      parts.push(block(section.title, section.description))
    }
  }

  return parts.join('\n\n')
}
