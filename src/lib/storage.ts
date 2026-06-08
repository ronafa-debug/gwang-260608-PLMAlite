const PREFIX = 'plma_lite_'

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
