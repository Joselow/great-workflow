export const getStoredData = (name: string): string | null => {
  return localStorage.getItem(`${name}`)
}

export const setStoredData = (name: string, data: string): void => {
  localStorage.setItem(name, data)
}

export const clearStoredData = (name: string): void => {
  localStorage.removeItem(name)
}