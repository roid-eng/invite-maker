'use client'

import { useEffect } from 'react'
import { logViewInvitation } from '@/lib/analytics'

// SSR 페이지에서 분리된 클라이언트 컴포넌트 — 마운트 시 analytics 이벤트 발송
export default function ViewAnalytics({ id }: { id: string }) {
  useEffect(() => {
    logViewInvitation(id)
  }, [id])

  return null
}
