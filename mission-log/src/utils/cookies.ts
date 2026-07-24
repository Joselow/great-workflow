const TOKEN_KEY = 'STATIC_AUTH_TOKEN_SESSION'

export const getCookie = (name: string = TOKEN_KEY): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  
  return null
}

export const setCookie = (
  name: string, 
  value: string, 
  days: number = 30
): void => {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  
  const expires = `expires=${date.toUTCString()}`
  const sameSite = 'SameSite=Lax'
  
  document.cookie = `${name}=${value};${expires};path=/;${sameSite}`
}

export const deleteCookie = (name: string = TOKEN_KEY): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
}

export const setAuthToken = (token: string): void => {
  setCookie(TOKEN_KEY, token)
}

export const getAuthToken = (): string | null => {
  return getCookie(TOKEN_KEY)
}

export const deleteAuthToken = (): void => {
  deleteCookie(TOKEN_KEY)
}
