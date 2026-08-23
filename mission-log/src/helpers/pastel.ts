export interface PastelPalette {
    bg: string
    text: string
    border: string
    dot: string
}

const PALETTES: PastelPalette[] = [
    { bg: 'bg-brand-orange', text: 'text-white', border: 'border-brand-orange/50 dark:border-brand-orange/40', dot: 'bg-brand-orange' },
    { bg: 'bg-brand-cyan', text: 'text-white', border: 'border-brand-cyan/50 dark:border-brand-cyan/40', dot: 'bg-brand-cyan' },
    { bg: 'bg-brand-pink', text: 'text-white', border: 'border-brand-pink/50 dark:border-brand-pink/40', dot: 'bg-brand-pink' },
    { bg: 'bg-brand-mint', text: 'text-black', border: 'border-brand-mint/50 dark:border-brand-mint/40', dot: 'bg-brand-mint' },
    { bg: 'bg-brand-yellow', text: 'text-black', border: 'border-brand-yellow/50 dark:border-brand-yellow/40', dot: 'bg-brand-yellow' },
]

export const getPastelPalette = (seed: string): PastelPalette => {
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)

    return PALETTES[hash % PALETTES.length]
}
