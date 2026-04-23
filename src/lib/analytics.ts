import { logEvent } from 'firebase/analytics'
import { getAnalyticsInstance } from './firebase/index'
import type { Category, Theme } from '@/types'

// Analytics 인스턴스를 가져오되, SSR이면 null 반환
async function analytics() {
  if (typeof window === 'undefined') return null
  return getAnalyticsInstance()
}

// Analytics 실패는 UX에 영향을 주지 않도록 조용히 무시
async function track(
  event: string,
  params?: Record<string, string>,
): Promise<void> {
  try {
    const instance = await analytics()
    if (!instance) return
    logEvent(instance, event, params)
  } catch {
    // 프로덕션에서 Analytics 오류가 서비스를 중단시키지 않도록 무시
  }
}

export function logSelectCategory(category: Category): void {
  void track('select_category', { category })
}

export function logSelectTheme(theme: Theme): void {
  void track('select_theme', { theme })
}

export function logCompleteEditor(id: string): void {
  void track('complete_editor', { invitation_id: id })
}

export function logShareKakao(id: string): void {
  void track('share_kakao', { invitation_id: id })
}

export function logCopyLink(id: string): void {
  void track('copy_link', { invitation_id: id })
}

export function logSaveImage(id: string): void {
  void track('save_image', { invitation_id: id })
}

export function logViewInvitation(id: string): void {
  void track('view_invitation', { invitation_id: id })
}
