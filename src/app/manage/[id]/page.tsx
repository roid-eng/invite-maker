'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvitation } from '@/lib/firebase/invitations'
import { subscribeRsvpStats, type RsvpStats } from '@/lib/firebase/rsvp'
import ExpiredScreen from '@/components/ui/ExpiredScreen'
import type { InvitationData, Theme } from '@/types'
import type { Timestamp } from 'firebase/firestore'

// ─── 테마 팔레트 ──────────────────────────────────────────────
const PALETTE: Record<Theme, { primary: string; bg: string; light: string }> = {
  rose:  { primary: '#C4607A', bg: '#FCE0E6', light: '#FFF5F7' },
  gold:  { primary: '#C9973A', bg: '#FEF0CC', light: '#FFFBF0' },
  sage:  { primary: '#7A9E8A', bg: '#D8EEE2', light: '#F0F7F3' },
  mauve: { primary: '#9B6B8A', bg: '#E2C8E5', light: '#F7F0F7' },
}

// ─── 잠금 localStorage 유틸 ───────────────────────────────────
const lockKey = (id: string) => `manage_lock_${id}`
type LockData = { failCount: number; lockedUntil: number }

function getLock(id: string): LockData {
  try {
    const raw = localStorage.getItem(lockKey(id))
    return raw ? (JSON.parse(raw) as LockData) : { failCount: 0, lockedUntil: 0 }
  } catch { return { failCount: 0, lockedUntil: 0 } }
}

function saveLock(id: string, data: LockData): void {
  try { localStorage.setItem(lockKey(id), JSON.stringify(data)) } catch { /* 무시 */ }
}

// ─── D-day 계산 (RSVP 마감) ──────────────────────────────────
function calcDday(deadline: string): string {
  const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const diff     = Math.ceil(
    (new Date(deadline).getTime() - new Date(todayStr).getTime()) / 86_400_000,
  )
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-Day'
  return `마감됨`
}

// ─── 만료 배지 (초대장 유지 기간) ────────────────────────────
function expiryBadge(expiresAt?: Timestamp): string {
  if (!expiresAt) return ''
  const diff = Math.ceil((expiresAt.toDate().getTime() - Date.now()) / 86_400_000)
  if (diff <= 0) return '만료됨'
  return `D-${diff} 만료 예정`
}

// ─── 인증 화면 ────────────────────────────────────────────────
function AuthScreen({
  id,
  onSuccess,
  expectedCode,
}: {
  id: string
  onSuccess: () => void
  expectedCode: string
}) {
  const [input,    setInput]    = useState('')
  const [error,    setError]    = useState('')
  const [locked,   setLocked]   = useState(false)
  const [remaining, setRemaining] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const lock = getLock(id)
    if (lock.lockedUntil > Date.now()) {
      setLocked(true)
      const interval = setInterval(() => {
        const left = Math.ceil((lock.lockedUntil - Date.now()) / 1000)
        if (left <= 0) { setLocked(false); clearInterval(interval) }
        else setRemaining(left)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [id])

  const handleSubmit = () => {
    if (input.toUpperCase() === expectedCode) {
      saveLock(id, { failCount: 0, lockedUntil: 0 })
      onSuccess()
      return
    }
    const lock     = getLock(id)
    const newCount = lock.failCount + 1
    if (newCount >= 3) {
      const lockedUntil = Date.now() + 5 * 60 * 1000
      saveLock(id, { failCount: newCount, lockedUntil })
      setLocked(true)
      setRemaining(300)
      setError('')
    } else {
      saveLock(id, { failCount: newCount, lockedUntil: 0 })
      setError(`관리 코드가 올바르지 않습니다. (${newCount}/3)`)
    }
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5EDE8] px-6">
      <p className="mb-1 font-myeongjo text-[22px] font-extrabold text-[#C4607A]">
        참석 현황 확인
      </p>
      <p className="mb-8 font-dodum text-[12px] tracking-widest text-[#9E7070]">
        초대장 제작 시 발급된 4자리 코드를 입력하세요
      </p>

      <div className="w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(180,100,100,0.10)]">
        {locked ? (
          <p className="text-center font-dodum text-[13px] text-red-500">
            오류 3회 초과로 {Math.floor(remaining / 60)}분 {remaining % 60}초 후 재시도 가능합니다
          </p>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={4}
              placeholder="예: A3K9"
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="mb-3 w-full rounded-xl border border-[#E8D8D0] bg-[#FFF5F7]
                         px-4 py-3 text-center font-myeongjo text-[24px] font-bold
                         tracking-[8px] text-[#C4607A] outline-none
                         focus:border-[#C4607A] focus:ring-2 focus:ring-[#C4607A]/20"
            />
            {error && (
              <p className="mb-3 text-center font-dodum text-[12px] text-red-500">{error}</p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={input.length !== 4}
              className="w-full rounded-xl bg-[#C4607A] py-3 font-myeongjo text-[15px]
                         font-bold text-white shadow-[0_4px_14px_rgba(196,96,122,0.3)]
                         transition-all hover:bg-[#B0506A] disabled:cursor-not-allowed
                         disabled:opacity-40"
            >
              확인
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── 대시보드 ────────────────────────────────────────────────
function Dashboard({ data, id }: { data: InvitationData; id: string }) {
  const p = PALETTE[data.theme]
  const [stats, setStats] = useState<RsvpStats>({ attend: 0, absent: 0 })

  useEffect(() => {
    const unsub = subscribeRsvpStats(id, setStats)
    return unsub
  }, [id])

  const dday = data.deadline ? calcDday(data.deadline) : null

  return (
    <div className="min-h-screen bg-[#F5EDE8] pb-16">
      {/* 헤더 */}
      <header
        className="sticky top-0 z-30 flex h-[60px] items-center justify-center
                   border-b border-[#E8D8D0] bg-white shadow-[0_2px_12px_rgba(180,100,100,0.08)]"
      >
        <p className="font-myeongjo text-[16px] font-extrabold tracking-wide" style={{ color: p.primary }}>
          참석 현황
        </p>
      </header>

      <div className="mx-auto max-w-[480px] space-y-4 px-4 pt-5">

        {/* 초대장 정보 카드 */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: p.bg }}>
          <p className="font-dodum text-[10px] tracking-widest" style={{ color: p.primary }}>
            초대장 정보
          </p>
          <p className="mt-1 font-myeongjo text-[22px] font-extrabold" style={{ color: p.primary }}>
            {data.name}
          </p>
          <p className="mt-2 font-dodum text-[13px] text-[#5A3A3A]">{data.date} · {data.time}</p>
          <p className="font-dodum text-[13px] text-[#5A3A3A]">{data.placeName}</p>
          {data.expiresAt && (
            <div className="mt-3 flex items-center justify-between rounded-xl
                            bg-white/60 px-3 py-2">
              <p className="font-dodum text-[11px] font-bold" style={{ color: p.primary }}>
                {expiryBadge(data.expiresAt)}
              </p>
              <button
                type="button"
                className="font-dodum text-[10px] underline underline-offset-2"
                style={{ color: p.primary }}
              >
                프리미엄으로 연장하기
              </button>
            </div>
          )}
        </div>

        {/* 참석 현황 요약 */}
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(180,100,100,0.07)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-myeongjo text-[15px] font-bold text-[#3A1D1D]">참석 현황</p>
            {dday && (
              <span
                className="rounded-full px-3 py-1 font-dodum text-[11px] font-bold"
                style={{ backgroundColor: p.light, color: p.primary }}
              >
                RSVP {dday}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <div
              className="flex flex-1 flex-col items-center rounded-xl py-4"
              style={{ backgroundColor: p.light }}
            >
              <p className="font-myeongjo text-[32px] font-extrabold" style={{ color: p.primary }}>
                {stats.attend}
              </p>
              <p className="font-dodum text-[11px] tracking-widest text-[#9E7070]">참석 예정</p>
            </div>
            <div className="flex flex-1 flex-col items-center rounded-xl bg-[#F5F5F5] py-4">
              <p className="font-myeongjo text-[32px] font-extrabold text-[#9E7070]">
                {stats.absent}
              </p>
              <p className="font-dodum text-[11px] tracking-widest text-[#9E7070]">불참</p>
            </div>
          </div>
          <p className="mt-3 text-center font-dodum text-[10px] tracking-wider text-[#BFAAAA]">
            실시간 업데이트 중
          </p>
        </div>

        {/* 참석자 명단 (프리미엄 잠금) */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(180,100,100,0.07)]">
          <p className="mb-3 font-myeongjo text-[15px] font-bold text-[#3A1D1D]">참석자 명단</p>
          {/* 더미 행 */}
          {['홍 길 동  2명', '김 영 희  4명', '이 철 수  1명'].map((row) => (
            <div
              key={row}
              className="mb-2 flex items-center justify-between rounded-lg
                         bg-[#F5EDE8] px-4 py-3 blur-sm select-none"
            >
              <span className="font-dodum text-[13px] text-[#5A3A3A]">{row}</span>
              <span className="font-dodum text-[11px] text-[#9E7070]">참석 예정</span>
            </div>
          ))}
          {/* 잠금 오버레이 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center
                          rounded-2xl bg-white/80 backdrop-blur-[2px]">
            <span className="text-[32px]">🔒</span>
            <p className="mt-2 font-myeongjo text-[14px] font-bold text-[#3A1D1D]">
              명단 확인은 프리미엄 기능입니다
            </p>
            <button
              type="button"
              className="mt-3 rounded-xl px-5 py-2.5 font-dodum text-[12px]
                         font-bold text-white shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: p.primary }}
            >
              프리미엄으로 업그레이드
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
type Props = { params: { id: string } }

export default function ManagePage({ params }: Props) {
  const router    = useRouter()
  const [data,    setData]    = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authed,  setAuthed]  = useState(false)

  useEffect(() => {
    getInvitation(params.id)
      .then((inv) => { if (!inv) router.replace('/'); else setData(inv) })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5EDE8]">
        <span className="inline-block h-8 w-8 rounded-full border-2
                         border-[#C4607A]/30 border-t-[#C4607A] animate-spin" />
      </div>
    )
  }

  if (!data) return null

  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return <ExpiredScreen />
  }

  if (!authed) {
    return (
      <AuthScreen
        id={params.id}
        expectedCode={data.manageCode ?? ''}
        onSuccess={() => setAuthed(true)}
      />
    )
  }

  return <Dashboard data={data} id={params.id} />
}
