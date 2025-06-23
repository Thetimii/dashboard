// Auth recovery utility functions
export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    // Clear all Supabase-related items from localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Clear sessionStorage as well
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('sb-')) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
  }
}

export const isRefreshTokenError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('refresh token') || 
           message.includes('refresh_token') ||
           message.includes('invalid refresh token') ||
           message.includes('refresh token not found')
  }
  return false
}
