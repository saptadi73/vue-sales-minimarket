/**
 * Utility untuk manage API Base URL secara dinamis
 * Memungkinkan user mengubah Odoo URL dari login page
 */

const API_URL_STORAGE_KEY = 'apiBaseUrl'

/**
 * Get API Base URL dari localStorage, atau fallback ke env variable
 */
export function getApiBaseUrl(): string {
  // Cek localStorage terlebih dahulu (user-provided URL)
  const storedUrl = localStorage.getItem(API_URL_STORAGE_KEY)
  if (storedUrl) {
    return storedUrl
  }

  // Fallback ke environment variable
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8069'
}

/**
 * Set API Base URL dan simpan ke localStorage
 */
export function setApiBaseUrl(url: string): void {
  // Normalize URL - tambahkan http:// jika belum ada
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'http://' + normalizedUrl
  }

  // Remove trailing slash jika ada
  normalizedUrl = normalizedUrl.replace(/\/$/, '')

  localStorage.setItem(API_URL_STORAGE_KEY, normalizedUrl)
}

/**
 * Clear API Base URL (gunakan default dari env)
 */
export function clearApiBaseUrl(): void {
  localStorage.removeItem(API_URL_STORAGE_KEY)
}

/**
 * Validate URL format
 */
export function validateApiUrl(url: string): { valid: boolean; error?: string } {
  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    return { valid: false, error: 'URL tidak boleh kosong' }
  }

  try {
    // Normalize untuk testing
    let testUrl = trimmedUrl
    if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
      testUrl = 'http://' + testUrl
    }

    // Coba parse sebagai URL
    new URL(testUrl)
    return { valid: true }
  } catch {
    return {
      valid: false,
      error: 'Format URL tidak valid (contoh: localhost:8069 atau https://odoo.example.com)',
    }
  }
}
