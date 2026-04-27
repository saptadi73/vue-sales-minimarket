export interface AppNotificationDetail {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const APP_NOTIFY_EVENT = 'app-notify'

export function notify(detail: AppNotificationDetail): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<AppNotificationDetail>(APP_NOTIFY_EVENT, { detail }))
}

export function notifySuccess(title: string, message?: string, duration?: number): void {
  notify({ type: 'success', title, message, duration })
}

export function notifyError(title: string, message?: string, duration?: number): void {
  notify({ type: 'error', title, message, duration })
}

export function notifyWarning(title: string, message?: string, duration?: number): void {
  notify({ type: 'warning', title, message, duration })
}

export function notifyInfo(title: string, message?: string, duration?: number): void {
  notify({ type: 'info', title, message, duration })
}
