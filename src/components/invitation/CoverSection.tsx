'use client'

import { useEffect, useState } from 'react'
import type { Category, Theme } from '@/types'

// ─── Props ────────────────────────────────────────────────────
type Props = {
  theme: Theme
  name: string
  category: Category
  showPetals: boolean
}

// ─── 꽃잎 데이터 ──────────────────────────────────────────────
type PetalData = {
  id: number
  emoji: string
  left: number    // %
  size: number    // px
  duration: number // s
  delay: number   // s
}

const PETAL_EMOJIS = ['🌸', '🌺', '🌼', '✿', '❀'] as const

// ─── 카테고리별 텍스트 ────────────────────────────────────────
const CATEGORY_CONTENT: Record<
  Category,
  { hanja: string; korean: string; badge: string }
> = {
  chilsung:  { hanja: '七旬', korean: '칠 순 잔 치',  badge: 'CHILSUN INVITATION · 칠순 초대장' },
  doljanchi: { hanja: '돌',   korean: '돌 잔 치',     badge: 'DOLJANCHI INVITATION · 돌잔치 초대장' },
  birthday:  { hanja: '生',   korean: '생 일 파 티',  badge: 'BIRTHDAY INVITATION · 생일 초대장' },
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type ThemePalette = {
  coverBg: string
  badge: string
  hanja: string
  korean: string
  dividerLine: string
  dividerDot: string
  name: string
}

const PALETTE: Record<Theme, ThemePalette> = {
  rose: {
    coverBg:     'linear-gradient(160deg, #FDE8EC 0%, #FCDDE5 50%, #FBD0DC 100%)',
    badge:       '#C4607A',
    hanja:       '#C4607A',
    korean:      '#C4607A',
    dividerLine: 'linear-gradient(to right, transparent, rgba(196,96,122,0.3), transparent)',
    dividerDot:  '#C4607A',
    name:        '#8B2040',
  },
  gold: {
    coverBg:     'linear-gradient(160deg, #FEF6E4 0%, #FDF0CC 50%, #FAE8A8 100%)',
    badge:       '#9B7220',
    hanja:       '#8B6010',
    korean:      '#9B7220',
    dividerLine: 'linear-gradient(to right, transparent, rgba(201,151,58,0.4), transparent)',
    dividerDot:  '#C9973A',
    name:        '#6B4A08',
  },
  sage: {
    coverBg:     'linear-gradient(160deg, #E8F5EE 0%, #D8EEE2 50%, #C8E5D5 100%)',
    badge:       '#4A7A60',
    hanja:       '#3A6A50',
    korean:      '#4A7A60',
    dividerLine: 'linear-gradient(to right, transparent, rgba(122,158,138,0.4), transparent)',
    dividerDot:  '#7A9E8A',
    name:        '#234530',
  },
  mauve: {
    coverBg:     'linear-gradient(160deg, #F5E8F5 0%, #EDD8EE 50%, #E2C8E5 100%)',
    badge:       '#7A4A7A',
    hanja:       '#6A3A6A',
    korean:      '#7A4A7A',
    dividerLine: 'linear-gradient(to right, transparent, rgba(155,107,138,0.4), transparent)',
    dividerDot:  '#9B6B8A',
    name:        '#4A1A4A',
  },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function CoverSection({ theme, name, category, showPetals }: Props) {
  const [petals, setPetals] = useState<PetalData[]>([])
  const p = PALETTE[theme]
  const c = CATEGORY_CONTENT[category]

  // 꽃잎은 클라이언트에서만 생성 (hydration mismatch 방지)
  useEffect(() => {
    if (!showPetals) {
      setPetals([])
      return
    }
    setPetals(
      Array.from({ length: 14 }, (_, i) => ({
        id:       i,
        emoji:    PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
        left:     Math.random() * 100,
        size:     12 + Math.random() * 10,
        duration: 3 + Math.random() * 4,
        delay:    Math.random() * 5,
      })),
    )
  }, [showPetals])

  return (
    <div
      className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden
                 px-6 pb-8 pt-10 text-center transition-[background] duration-500"
      style={{ background: p.coverBg }}
    >
      {/* 꽃잎 레이어 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="absolute top-[-20px]"
            style={{
              left:                    `${petal.left}%`,
              fontSize:                `${petal.size}px`,
              animationName:           'falling',
              animationDuration:       `${petal.duration}s`,
              animationDelay:          `${petal.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              opacity:                 0.5,
            }}
          >
            {petal.emoji}
          </span>
        ))}
      </div>

      {/* 배지 */}
      <p
        className="mb-4 font-dodum text-[10px] tracking-[4px] opacity-70"
        style={{ color: p.badge }}
      >
        {c.badge}
      </p>

      {/* 한자 */}
      <h1
        className="mb-1.5 font-myeongjo text-[56px] font-extrabold leading-none"
        style={{ color: p.hanja, textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        {c.hanja}
      </h1>

      {/* 행사 종류 (한글) */}
      <p
        className="mb-5 text-[15px] tracking-[5px] opacity-70"
        style={{ color: p.korean }}
      >
        {c.korean}
      </p>

      {/* 구분선 */}
      <div className="mb-5 flex w-full items-center gap-2.5">
        <div className="h-px flex-1" style={{ background: p.dividerLine }} />
        <span className="text-xs opacity-50" style={{ color: p.dividerDot }}>❖</span>
        <div className="h-px flex-1" style={{ background: p.dividerLine }} />
      </div>

      {/* 주인공 이름 */}
      <p
        className="font-myeongjo text-[32px] font-extrabold tracking-[10px]"
        style={{ color: p.name }}
      >
        {name}
      </p>
    </div>
  )
}
