'use client'

import Link from 'next/link'
import { logSelectCategory } from '@/lib/analytics'
import type { Category } from '@/types'

type CardConfig = {
  id:          Category
  symbol:      string
  label:       string
  description: string
  active:      boolean
  primary:     string
  bgLight:     string
  border:      string
}

const CARDS: CardConfig[] = [
  {
    id:          'chilsung',
    symbol:      '七旬',
    label:       '칠순',
    description: '어르신의 귀한 날을\n함께 기념해요',
    active:      true,
    primary:     '#C4607A',
    bgLight:     '#FFF0F3',
    border:      '#F9C8D4',
  },
  {
    id:          'doljanchi',
    symbol:      '돌',
    label:       '돌잔치',
    description: '아이의 첫 번째\n소중한 생일',
    active:      false,
    primary:     '#8B5CF6',
    bgLight:     '#F5F0FF',
    border:      '#D8B4FE',
  },
  {
    id:          'birthday',
    symbol:      '生日',
    label:       '생일',
    description: '사랑하는 사람의\n특별한 날',
    active:      false,
    primary:     '#D97706',
    bgLight:     '#FFFBEB',
    border:      '#FDE68A',
  },
]

function CardBody({ card }: { card: CardConfig }) {
  return (
    <>
      {/* 카테고리 심볼 */}
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl
                   font-myeongjo text-[14px] font-bold leading-none"
        style={{
          background:   card.bgLight,
          color:        card.primary,
          border:       `1px solid ${card.border}`,
        }}
      >
        {card.symbol}
      </div>

      {/* 이름 */}
      <p className="font-myeongjo text-[15px] font-bold text-[#3B0A1F]">
        {card.label}
      </p>

      {/* 설명 */}
      <p className="mt-1 whitespace-pre-line font-dodum text-[11px] leading-relaxed text-[#9E7070]">
        {card.description}
      </p>

      {/* CTA / 준비중 */}
      {card.active ? (
        <p className="mt-3 font-dodum text-[12px] font-bold" style={{ color: card.primary }}>
          시작하기 →
        </p>
      ) : (
        <span className="mt-3 inline-block rounded-full bg-[#F3EEF8] px-2.5 py-0.5
                         font-dodum text-[10px] tracking-wide text-[#A08AB0]">
          준비 중
        </span>
      )}
    </>
  )
}

export default function CategoryCards() {
  return (
    <div className="mx-auto grid max-w-lg grid-cols-3 gap-3">
      {CARDS.map((card) =>
        card.active ? (
          <Link
            key={card.id}
            href={`/make/${card.id}`}
            onClick={() => logSelectCategory(card.id)}
            className="flex flex-col items-center rounded-3xl border border-[#F0DDE4]
                       bg-white p-4 text-center
                       shadow-[0_2px_12px_rgba(196,96,122,0.07)]
                       transition-all hover:-translate-y-0.5
                       hover:shadow-[0_6px_20px_rgba(196,96,122,0.14)]
                       active:translate-y-0 active:scale-[0.97]"
          >
            <CardBody card={card} />
          </Link>
        ) : (
          <div
            key={card.id}
            className="flex cursor-not-allowed flex-col items-center rounded-3xl
                       border border-[#EDEAED] bg-white/60 p-4 text-center opacity-60"
          >
            <CardBody card={card} />
          </div>
        )
      )}
    </div>
  )
}
