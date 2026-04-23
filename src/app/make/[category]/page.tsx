'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar           from '@/components/editor/Sidebar'
import InvitationPreview from '@/components/invitation/InvitationPreview'
import { createInvitation } from '@/lib/firebase/invitations'
import { logCompleteEditor } from '@/lib/analytics'
import { useInvitation } from '@/hooks/useInvitation'
import type { Category, InvitationData, InvitationState } from '@/types'

// Daum Postcode 전역 타입 선언
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: { address: string }) => void }) => { open(): void }
    }
  }
}

function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.daum?.Postcode) { resolve(); return }
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

// ─── 카테고리 가드 ────────────────────────────────────────────
const VALID_CATEGORIES = new Set<string>(['chilsung', 'doljanchi', 'birthday'])

function toCategory(raw: string): Category {
  return VALID_CATEGORIES.has(raw) ? (raw as Category) : 'chilsung'
}

// ─── InvitationState → createInvitation 입력 변환 ────────────
function toCreateInput(
  state: InvitationState,
): Omit<InvitationData, 'id' | 'createdAt' | 'viewCount' | 'meta'> {
  return {
    category:     state.category,
    theme:        state.theme,
    name:         state.name,
    born:         state.born      || undefined,
    eventType:    state.eventType || undefined,
    date:         state.date,
    time:         state.time,
    placeName:    state.placeName,
    placeAddress: state.placeAddress,
    message:      state.message   || undefined,
    deadline:     state.deadline  || undefined,
    children:     state.children.length > 0 ? state.children : undefined,
    features:     state.features,
  }
}

// ─── 입력 유효성 검사 ─────────────────────────────────────────
function validate(state: InvitationState): string | null {
  if (!state.name.trim())         return '주인공 성함을 입력해 주세요.'
  if (!state.date)                return '행사 날짜를 선택해 주세요.'
  if (!state.time)                return '행사 시간을 입력해 주세요.'
  if (!state.placeName.trim())    return '장소명을 입력해 주세요.'
  if (!state.placeAddress.trim()) return '장소 주소를 입력해 주세요.'

  // 과거 날짜 차단 — KST 기준
  const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (state.date < todayKST) return '과거 날짜는 선택할 수 없습니다.'

  return null
}

// ─── 토스트 ───────────────────────────────────────────────────
type ToastProps = { message: string; variant: 'error' | 'success' }

function Toast({ message, variant }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed right-4 top-4 z-50 max-w-xs rounded-xl px-4 py-3
                  font-dodum text-sm text-white shadow-xl
                  animate-[fadeInDown_0.2s_ease-out]
                  ${variant === 'error' ? 'bg-red-500' : 'bg-[#4A7A60]'}`}
    >
      {message}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
type Props = { params: { category: string } }

export default function MakePage({ params }: Props) {
  const router   = useRouter()
  const category = toCategory(params.category)

  const { state, update } = useInvitation(category)

  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState<ToastProps | null>(null)

  const showToast = useCallback((message: string, variant: ToastProps['variant'] = 'error') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleAddressSearch = useCallback(async () => {
    await loadDaumPostcodeScript()
    new window.daum!.Postcode({
      oncomplete(data) {
        update({ placeAddress: data.address })
      },
    }).open()
  }, [update])

  // 미리보기용 데이터 — 빈 필수 필드는 힌트 텍스트로 대체
  const previewData: InvitationData = useMemo(() => ({
    ...toCreateInput(state),
    name:      state.name      || '(성함 입력)',
    placeName: state.placeName || '(장소명 입력)',
  }), [state])

  const handleSave = async () => {
    const error = validate(state)
    if (error) { showToast(error); return }

    setSaving(true)
    try {
      const id = await createInvitation(toCreateInput(state))
      logCompleteEditor(id)
      router.push(`/preview/${id}`)
    } catch {
      showToast('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F5EDE8]">

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between
                   border-b border-[#E8D8D0] bg-white px-6
                   shadow-[0_2px_12px_rgba(180,100,100,0.08)]"
      >
        {/* 로고 */}
        <div>
          <p className="font-myeongjo text-[18px] font-extrabold tracking-wide text-[#C4607A]">
            초대<span className="text-[#C9973A]">장</span>메이커
          </p>
          <p className="font-dodum text-[10px] tracking-widest text-[#9E7070]">
            INVITATION MAKER · 무료 모바일 초대장
          </p>
        </div>

        {/* 완성하기 버튼 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[#C4607A] px-5 py-2.5
                     font-myeongjo text-[13px] font-bold text-white
                     shadow-[0_4px_14px_rgba(196,96,122,0.3)]
                     transition-all hover:-translate-y-px hover:bg-[#B0506A]
                     active:translate-y-0 active:opacity-80
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <span
                className="inline-block h-4 w-4 rounded-full border-2
                           border-white/30 border-t-white animate-spin"
              />
              저장 중…
            </>
          ) : (
            '초대장 완성하기'
          )}
        </button>
      </header>

      {/* ── 본문 ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — PC: 320px 고정 / 모바일: fixed bottom 60vh */}
        <Sidebar state={state} onChange={update} onAddressSearch={handleAddressSearch} />

        {/* 미리보기 영역 */}
        <main
          className="flex-1 overflow-y-auto
                     pb-[60vh] md:pb-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(196,96,122,0.06) 0%, transparent 50%),' +
              'radial-gradient(circle at 80% 80%, rgba(201,151,58,0.06) 0%, transparent 50%)',
          }}
        >
          <InvitationPreview data={previewData} isPreview />
        </main>
      </div>

      {/* 토스트 알림 */}
      {toast && <Toast {...toast} />}
    </div>
  )
}
