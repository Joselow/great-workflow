export const isLightHex = (hex: string) => {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return false

  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)

  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}

const lightEdge = {
  borderColor: 'rgba(24, 24, 27, 0.28)',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(24, 24, 27, 0.06)',
}

export const cardSurfaceStyle = (color: string) => ({
  backgroundColor: `${color}04`,
  borderColor: isLightHex(color) ? lightEdge.borderColor : `${color}40`,
  boxShadow: isLightHex(color) ? lightEdge.boxShadow : undefined,
})

export const cardTileStyle = (color: string) => ({
  backgroundColor: isLightHex(color) ? `${color}cc` : `${color}33`,
  borderColor: isLightHex(color) ? lightEdge.borderColor : `${color}99`,
  boxShadow: isLightHex(color) ? lightEdge.boxShadow : undefined,
})
