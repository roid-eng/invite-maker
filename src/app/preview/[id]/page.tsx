'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvitation } from '@/lib/firebase/invitations'
import InvitationPreview from '@/components/invitation/InvitationPreview'
import { logCopyLink, logShareKakao, logSaveImage } from '@/lib/analytics'
import type { InvitationData } from '@/types'

// window.Kakao 타입 선언
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void
      }
    }
  }
}

type Props = { params: { id: string } }

export default function PreviewPage({ params }: Props) {
  const router   = useRouter()
  const captureRef = useRef<HTMLDivElement>(null)

  const [data,    setData]    = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)
  const [saving,  setSaving]  = useState(false)

  // ─── 초대장 데이터 로드 ───────────────────────────────────────
  useEffect(() => {
    getInvitation(params.id)
      .then((inv) => {
        if (!inv) { router.replace('/'); return }
        setData(inv)
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  // ─── 링크 복사 ───────────────────────────────────────────────
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/invite/${params.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard API 미지원 환경 폴백
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    logCopyLink(params.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── 카카오톡 공유 (SDK lazy load) ───────────────────────────
  const handleShareKakao = async () => {
    try {
      // SDK 스크립트 미로드 시 동적 삽입
      if (!document.getElementById('kakao-sdk-script')) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.id  = 'kakao-sdk-script'
          script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
          script.crossOrigin = 'anonymous'
          script.onload  = () => resolve()
          script.onerror = () => reject(new Error('Kakao SDK 로드 실패'))
          document.head.appendChild(script)
        })
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!)
      }

      const inviteUrl   = `${window.location.origin}/invite/${params.id}`
      const title       = data ? `${data.name}님의 초대장` : '초대장'
      const description = data ? `${data.date} · ${data.placeName}` : ''

      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl: `${window.location.origin}/og/default.png`,
          link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
        },
        buttons: [
          { title: '초대장 보기', link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl } },
        ],
      })

      logShareKakao(params.id)
    } catch {
      // 공유 실패는 조용히 무시
    }
  }

  // ─── 이미지 저장 (html2canvas lazy import) ───────────────────
  const handleSaveImage = async () => {
    if (!captureRef.current || saving) return
    setSaving(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale:   2,
        backgroundColor: null,
      })
      const link      = document.createElement('a')
      link.download   = `초대장_${params.id}.png`
      link.href       = canvas.toDataURL('image/png')
      link.click()
      logSaveImage(params.id)
    } catch {
      // 캡처 실패는 조용히 무시
    } finally {
      setSaving(false)
    }
  }

  // ─── 로딩 ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF5F7]">
        <span
          className="inline-block h-8 w-8 rounded-full border-2
                     border-[#C4607A]/30 border-t-[#C4607A] animate-spin"
        />
      </div>
    )
  }

  if (!data) return null

  // ─── 공유 버튼 공통 스타일 ───────────────────────────────────
  const btnBase =
    'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3.5 font-dodum text-[12px] transition-all active:scale-95'

  return (
    <div className="flex min-h-screen flex-col bg-[#F5EDE8]">

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-30 flex h-[60px] items-center justify-center
                   border-b border-[#E8D8D0] bg-white
                   shadow-[0_2px_12px_rgba(180,100,100,0.08)]"
      >
        <div className="text-center">
          <p className="font-myeongjo text-[16px] font-extrabold tracking-wide text-[#C4607A]">
            초대장 완성!
          </p>
          <p className="font-dodum text-[10px] tracking-widest text-[#9E7070]">
            아래 버튼으로 공유해보세요
          </p>
        </div>
      </header>

      {/* ── 초대장 미리보기 (캡처 대상 포함) ── */}
      <main className="flex-1 overflow-y-auto pb-[148px]">
        <div ref={captureRef}>
          <InvitationPreview data={data} isPreview />
        </div>
      </main>

      {/* ── 하단 고정 공유 시트 ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40
                   border-t border-[#E8D8D0] bg-white/95 px-4 py-4
                   backdrop-blur-sm"
      >
        <p className="mb-3 text-center font-dodum text-[11px] tracking-widest text-[#9E7070]">
          공유하기
        </p>

        <div className="flex gap-2.5">

          {/* 링크 복사 */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`${btnBase} border border-[#E8D8D0] bg-white text-[#5A3A3A]
                        hover:border-[#C4607A]/30 hover:bg-[#FFF5F7]`}
          >
            {/* 링크 아이콘 / 체크 아이콘 */}
            {copied ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A7A60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4607A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
            <span className={copied ? 'text-[#4A7A60] font-bold' : ''}>
              {copied ? '복사됨!' : '링크 복사'}
            </span>
          </button>

          {/* 카카오톡 공유 */}
          <button
            type="button"
            onClick={handleShareKakao}
            className={`${btnBase} bg-[#FEE500] text-[#3A1D1D] hover:bg-[#FDD800]`}
          >
            {/* 카카오 말풍선 아이콘 */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#3A1D1D">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.701 1.553 5.084 3.9 6.51L4.8 21l4.63-2.46A11.5 11.5 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3Z" />
            </svg>
            카카오톡 공유
          </button>

          {/* 이미지 저장 */}
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={saving}
            className={`${btnBase} border border-[#E8D8D0] bg-white text-[#5A3A3A]
                        hover:border-[#C4607A]/30 hover:bg-[#FFF5F7]
                        disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {saving ? (
              <span
                className="inline-block h-[22px] w-[22px] rounded-full border-2
                           border-[#C4607A]/30 border-t-[#C4607A] animate-spin"
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4607A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
            <span>{saving ? '저장 중…' : '이미지 저장'}</span>
          </button>

        </div>
      </div>
    </div>
  )
}
