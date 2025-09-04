"use client"

export const TOKEN_STORAGE_KEY = "bh_token"

export function setToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
