export interface ProjectColorOption {
  id: string
  value: string
  label: string
}

export const DEFAULT_PROJECT_COLOR = '#f5f5f4'

export const PROJECT_COLORS: ProjectColorOption[] = [
  { id: 'neutral', value: '#f5f5f4', label: 'Neutral' },
  { id: 'cyan', value: '#00C2CB', label: 'Cyan' },
  { id: 'mint', value: '#7FE0D4', label: 'Mint' },
  { id: 'yellow', value: '#FFE38A', label: 'Yellow' },
  { id: 'orange', value: '#FF9A76', label: 'Orange' },
  { id: 'pink', value: '#FF5D8F', label: 'Pink' },
  { id: 'sky', value: '#BAE6FD', label: 'Sky' },
  { id: 'lavender', value: '#DDD6FE', label: 'Lavender' },
]
