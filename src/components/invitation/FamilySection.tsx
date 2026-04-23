import type { ChildInfo, Theme } from '@/types'

// ─── Props ────────────────────────────────────────────────────
// prop 이름 'members': React의 children 예약어 충돌 방지
type Props = {
  theme: Theme
  members?: ChildInfo[]
  showFamily: boolean
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type FamilyPalette = {
  bg: string
  label: string
  name: string
}

const PALETTE: Record<Theme, FamilyPalette> = {
  rose:  { bg: '#FDE8EC', label: '#C4607A', name: '#8B2040' },
  gold:  { bg: '#FEF6E4', label: '#9B7220', name: '#6B4A08' },
  sage:  { bg: '#E8F5EE', label: '#4A7A60', name: '#234530' },
  mauve: { bg: '#EDD8EE', label: '#7A4A7A', name: '#4A1A4A' },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function FamilySection({ theme, members, showFamily }: Props) {
  if (!showFamily || !members?.length) return null

  const p = PALETTE[theme]
  const items = members.slice(0, 4) // 최대 4명

  return (
    <section
      className="px-5 py-6 text-center transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      <p
        className="mb-4 font-dodum text-[10px] tracking-[4px] opacity-50"
        style={{ color: p.label }}
      >
        ✦ 자녀 일동
      </p>

      {/* 자녀 목록: 1~4명 플렉스 레이아웃, 구분선은 마지막 항목 제외 */}
      <div className="flex justify-center">
        {items.map((child, idx) => (
          <div
            key={`${child.role}-${idx}`}
            className="px-3.5"
            style={{
              borderRight: idx < items.length - 1
                ? '1px solid rgba(0,0,0,0.1)'
                : 'none',
            }}
          >
            <p
              className="mb-1 font-dodum text-[9px] tracking-[2px] opacity-45"
              style={{ color: p.label }}
            >
              {child.role}
            </p>
            <p
              className="font-myeongjo text-sm font-bold tracking-[2px]"
              style={{ color: p.name }}
            >
              {child.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
