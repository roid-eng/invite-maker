'use client'

import { useState } from 'react'
import type { Theme } from '@/types'

// ─── Types ────────────────────────────────────────────────────
type RsvpType = 'attend' | 'absent'

type Props = {
  theme: Theme
  showRsvp: boolean
  deadline?: string
  onSubmit: (type: RsvpType, name: string, count: number) => Promise<void>
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type RsvpPalette = {
  primaryBg: string
  secondaryColor: string
  secondaryBorder: string
  muted: string
}

const PALETTE: Record<Theme, RsvpPalette> = {
  rose: {
    primaryBg:       '#C4607A',
    secondaryColor:  '#C4607A',
    secondaryBorder: '#F0C0CC',
    muted:           '#C4607A',
  },
  gold: {
    primaryBg:       '#C9973A',
    secondaryColor:  '#9B7220',
    secondaryBorder: '#E8C870',
    muted:           '#9B7220',
  },
  sage: {
    primaryBg:       '#7A9E8A',
    secondaryColor:  '#7A9E8A',
    secondaryBorder: '#A8D5BA',
    muted:           '#4A7A60',
  },
  mauve: {
    primaryBg:       '#9B6B8A',
    secondaryColor:  '#9B6B8A',
    secondaryBorder: '#D0A8CC',
    muted:           '#7A4A7A',
  },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function RsvpSection({ theme, showRsvp, deadline, onSubmit }: Props) {
  const p = PALETTE[theme]

  const [modalType, setModalType]   = useState<RsvpType | null>(null)
  const [name, setName]             = useState('')
  const [count, setCount]           = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [done, setDone]             = useState<{ type: RsvpType; name: string } | null>(null)

  // 훅 규칙: 조건 반환은 모든 hook 선언 이후
  if (!showRsvp) return null

  const openModal = (type: RsvpType) => {
    setModalType(type)
    setName('')
    setCount(1)
    setError('')
  }

  const closeModal = () => setModalType(null)

  const handleCountChange = (raw: string) => {
    const parsed = parseInt(raw, 10)
    setCount(isNaN(parsed) ? 1 : Math.max(1, Math.min(10, parsed)))
  }

  const handleSubmit = async () => {
    if (!modalType || !name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(modalType, name.trim(), count)
      setDone({ type: modalType, name: name.trim() })
      closeModal()
    } catch {
      setError('전송에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* ── 섹션 본문 ── */}
      <section className="px-5 py-7 text-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p
          className="mb-1.5 font-dodum text-[11px] tracking-[4px] opacity-50"
          style={{ color: p.muted }}
        >
          R · S · V · P
        </p>
        <p
          className="mb-5 font-serif text-[13px] font-light leading-[1.8] opacity-70"
          style={{ color: p.muted }}
        >
          참석 여부를 알려주시면<br />더욱 감사하겠습니다.
        </p>

        {done ? (
          /* 응답 완료 상태 */
          <div className="py-2">
            <div className="mb-3 text-4xl">🙏</div>
            <p className="font-serif text-[13px] leading-[1.8]" style={{ color: p.muted }}>
              {done.type === 'attend' ? (
                <><strong>{done.name}</strong>님,<br />참석 의사를 전달해 주셨습니다.<br />감사합니다 🎊</>
              ) : (
                <><strong>{done.name}</strong>님,<br />소식 전해주셔서 감사합니다.<br />다음 기회에 함께해요 🙏</>
              )}
            </p>
          </div>
        ) : (
          /* 버튼 */
          <div className="flex gap-2">
            <button
              onClick={() => openModal('attend')}
              className="flex-1 rounded-[10px] py-3.5 font-myeongjo text-[13px] font-bold text-white
                         transition-opacity hover:opacity-85 active:opacity-75"
              style={{ backgroundColor: p.primaryBg }}
            >
              참석하겠습니다
            </button>
            <button
              onClick={() => openModal('absent')}
              className="flex-1 rounded-[10px] bg-white py-3.5 font-myeongjo text-[13px] font-bold
                         transition-opacity hover:opacity-85 active:opacity-75"
              style={{ color: p.secondaryColor, border: `1.5px solid ${p.secondaryBorder}` }}
            >
              불참하겠습니다
            </button>
          </div>
        )}

        {deadline && (
          <p
            className="mt-3 font-dodum text-[10px] opacity-40"
            style={{ color: p.muted }}
          >
            ※ {deadline}
          </p>
        )}
      </section>

      {/* ── 모달 ── */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2
              className="mb-5 font-myeongjo text-base font-bold"
              style={{ color: p.primaryBg }}
            >
              {modalType === 'attend' ? '참석' : '불참'} 의사 전달
            </h2>

            {/* 성함 */}
            <label className="mb-4 block">
              <span
                className="mb-1.5 block font-dodum text-[11px] tracking-widest opacity-60"
                style={{ color: p.muted }}
              >
                성 함
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e)  => (e.currentTarget.style.borderColor = p.primaryBg)}
                onBlur={(e)   => (e.currentTarget.style.borderColor = p.secondaryBorder)}
                placeholder="성함을 입력해 주세요"
                maxLength={20}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: p.secondaryBorder }}
              />
            </label>

            {/* 인원 */}
            <label className="mb-5 block">
              <span
                className="mb-1.5 block font-dodum text-[11px] tracking-widest opacity-60"
                style={{ color: p.muted }}
              >
                인 원 (1~10명)
              </span>
              <input
                type="number"
                value={count}
                onChange={(e) => handleCountChange(e.target.value)}
                onFocus={(e)  => (e.currentTarget.style.borderColor = p.primaryBg)}
                onBlur={(e)   => (e.currentTarget.style.borderColor = p.secondaryBorder)}
                min={1}
                max={10}
                step={1}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: p.secondaryBorder }}
              />
            </label>

            {/* 에러 메시지 */}
            {error && (
              <p className="mb-3 text-center text-[12px] text-red-500">{error}</p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl py-3 font-myeongjo text-sm font-bold transition-opacity hover:opacity-80"
                style={{ border: `1.5px solid ${p.secondaryBorder}`, color: p.secondaryColor }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="flex-1 rounded-xl py-3 font-myeongjo text-sm font-bold text-white
                           transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: p.primaryBg }}
              >
                {submitting ? '전송 중…' : '전달하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
