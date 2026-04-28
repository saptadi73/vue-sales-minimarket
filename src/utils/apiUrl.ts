/**
 * Utility untuk manage API Base URL secara dinamis
 * Memungkinkan user mengubah Odoo URL dari login page
 */

const API_URL_STORAGE_KEY = 'apiBaseUrl'

/**
 * Get API Base URL dari localStorage, atau fallback ke env variable.
 * Jika keduanya kosong, kembalikan '' (relative/same-origin — cocok untuk
 * deployment di belakang Nginx reverse proxy di domain yang sama).
 */
export function getApiBaseUrl(): string {
  // Cek localStorage terlebih dahulu (user-provided URL)
  const storedUrl = localStorage.getItem(API_URL_STORAGE_KEY)
  if (storedUrl) {
    return storedUrl
  }

  // Fallback ke environment variable (bisa berupa string kosong untuk same-origin)
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl !== undefined && envUrl !== null) {
    return envUrl as string
  }

  // Ultimate fallback — relative path (same-origin)
  return ''
}

/**
 * Set API Base URL dan simpan ke localStorage.
 * Jika url kosong, hapus entry localStorage sehingga fallback ke env/same-origin.
 */
export function setApiBaseUrl(url: string): void {
  const trimmed = url.trim()

  // URL kosong → gunakan mode relative/same-origin (hapus localStorage)
  if (!trimmed) {
    localStorage.removeItem(API_URL_STORAGE_KEY)
    return
  }

  // Normalize URL - tambahkan http:// jika belum ada
  let normalizedUrl = trimmed
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
 * Validate URL format.
 * String kosong dianggap valid (artinya pakai mode same-origin/Nginx proxy).
 */
export function validateApiUrl(url: string): { valid: boolean; error?: string } {
  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    return { valid: true } // kosong = relative/same-origin mode
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
