'use client'

import { useCallback } from 'react'
import CoverSection   from './CoverSection'
import MessageSection from './MessageSection'
import InfoSection    from './InfoSection'
import MapSection     from './MapSection'
import RsvpSection    from './RsvpSection'
import FamilySection  from './FamilySection'
import { submitRsvp } from '@/lib/firebase/rsvp'
import type { InvitationData, Theme } from '@/types'

// ─── 파일 내 Footer (별도 파일로 분리할 만큼 크지 않음) ───────

type FooterPalette = { bg: string; color: string }

const FOOTER_PALETTE: Record<Theme, FooterPalette> = {
  rose:  { bg: '#FCE0E6', color: '#C4607A' },
  gold:  { bg: '#FEF0CC', color: '#C9973A' },
  sage:  { bg: '#D8EEE2', color: '#7A9E8A' },
  mauve: { bg: '#E2C8E5', color: '#9B6B8A' },
}

function InvitationFooter({ theme }: { theme: Theme }) {
  const p = FOOTER_PALETTE[theme]
  return (
    <div
      className="px-5 pt-7 pb-10 text-center transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      <p
        className="font-myeongjo text-[22px] tracking-[8px] opacity-30"
        style={{ color: p.color }}
      >
        壽 · 福 · 康 · 寧
      </p>
      <p
        className="mt-1 font-dodum text-[9px] tracking-[3px] opacity-20"
        style={{ color: p.color }}
      >
        수 · 복 · 강 · 녕
      </p>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────

type Props = {
  data: InvitationData
  /**
   * true  → PC 에디터 미리보기 (모바일 폰 프레임 표시, RSVP Firestore 쓰기 비활성)
   * false → 수신자 뷰 /invite/[id] (풀스크린, 실제 RSVP 제출)
   */
  isPreview?: boolean
}

// ─── 컴포넌트 ─────────────────────────────────────────────────

export default function InvitationPreview({ data, isPreview = false }: Props) {
  const {
    id,
    theme,
    name,
    category,
    date,
    time,
    placeName,
    placeAddress,
    message,
    deadline,
    children,   // ChildInfo[] — FamilySection에 members로 전달
    features,
  } = data

  // features 필드가 없을 경우 기본값 true (모든 섹션 표시)
  const showPetals = features?.showPetals ?? true
  const showMap    = features?.showMap    ?? true
  const showRsvp   = features?.showRsvp   ?? true
  const showFamily = features?.showFamily ?? true

  // 미리보기일 때는 Firestore 쓰기 없이 즉시 resolve → done 상태만 표시
  const handleRsvpSubmit = useCallback(
    async (
      type: 'attend' | 'absent',
      rsvpName: string,
      count: number,
    ): Promise<void> => {
      if (isPreview || !id) return
      await submitRsvp(id, { name: rsvpName, count, type })
    },
    [isPreview, id],
  )

  // ── 섹션 조합 (Cover → Message → Info → Map → RSVP → Family → Footer) ──
  const sections = (
    <article className="font-myeongjo">
      <CoverSection
        theme={theme}
        name={name}
        category={category}
        showPetals={showPetals}
      />
      <MessageSection
        theme={theme}
        message={message}
      />
      <InfoSection
        theme={theme}
        date={date}
        time={time}
        placeName={placeName}
        placeAddress={placeAddress}
      />
      <MapSection
        theme={theme}
        placeName={placeName}
        placeAddress={placeAddress}
        showMap={showMap}
      />
      <RsvpSection
        theme={theme}
        showRsvp={showRsvp}
        deadline={deadline}
        onSubmit={handleRsvpSubmit}
      />
      <FamilySection
        theme={theme}
        members={children}
        showFamily={showFamily}
      />
      <InvitationFooter theme={theme} />
    </article>
  )

  /* ── 수신자 뷰: PC는 중앙 max-430px, 모바일은 풀스크린 ── */
  if (!isPreview) {
    return (
      <div className="flex min-h-screen justify-center bg-[#EDE4DC]">
        <main className="w-full max-w-[430px] bg-white pb-[72px]">
          {sections}
        </main>
      </div>
    )
  }

  /* ── PC 에디터 미리보기: 모바일 폰 프레임 ── */
  return (
    <div className="flex justify-center py-8">
      <div
        className="w-[360px] overflow-hidden rounded-[36px] bg-white"
        style={{
          boxShadow: '0 30px 80px rgba(100,50,50,0.18), 0 0 0 8px #2D1B1B',
        }}
      >
        {/* 상태바 — sticky로 스크롤해도 상단 고정 */}
        <div
          className="sticky top-0 z-10 flex justify-between bg-[#FFF8F0]
                     px-5 pb-1.5 pt-2.5 font-dodum text-[10px] text-[#9E7070]"
        >
          <span>9:41</span>
          <span>●●● 📶 🔋</span>
        </div>

        {/* 스크롤 영역 — 최대 680px, 스크롤바 숨김 */}
        <div
          className="max-h-[680px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {sections}
        </div>
      </div>
    </div>
  )
}
