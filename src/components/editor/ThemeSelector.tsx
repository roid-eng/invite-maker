'use client'

import type { Theme } from '@/types'

// ─── 테마 옵션 정의 ───────────────────────────────────────────
type ThemeOption = {
  key: Theme
  label: string
  gradient: string
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'rose',  label: '로즈핑크', gradient: 'linear-gradient(135deg, #F2899A, #E8607A)' },
  { key: 'gold',  label: '골드',    gradient: 'linear-gradient(135deg, #F0C87A, #C9973A)' },
  { key: 'sage',  label: '세이지',  gradient: 'linear-gradient(135deg, #8EC5A5, #4A7A60)' },
  { key: 'mauve', label: '모브',    gradient: 'linear-gradient(135deg, #D0A8CC, #9B6B8A)' },
]

// ─── Props ────────────────────────────────────────────────────
type Props = {
  value: Theme
  onChange: (theme: Theme) => void
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 pb-6">
      {THEME_OPTIONS.map(({ key, label, gradient }) => {
        const active = value === key
        return (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange(key)}
              aria-label={`테마: ${label}`}
              aria-pressed={active}
              className="h-9 w-full rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:   gradient,
                borderColor:  active ? '#2D1B1B' : 'transparent',
                // 선택 시 내부 흰 링: inset box-shadow로 구현
                boxShadow:    active ? '0 0 0 2px white inset, 0 2px 8px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.1)',
              }}
            />
            <span className="font-dodum text-[9px] text-[#9E7070]">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
