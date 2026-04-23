'use client'

import type { InvitationFeatures } from '@/types'

// ─── 토글 항목 정의 ───────────────────────────────────────────
type FeatureItem = {
  key: keyof InvitationFeatures
  icon: string
  label: string
}

const FEATURE_ITEMS: FeatureItem[] = [
  { key: 'showMap',    icon: '🗺',   label: '지도 / 길찾기' },
  { key: 'showRsvp',   icon: '✅',   label: '참석 여부 (RSVP)' },
  { key: 'showFamily', icon: '👨‍👩‍👧', label: '자녀 소개' },
  { key: 'showPetals', icon: '🌸',   label: '꽃잎 애니메이션' },
]

// ─── Props ────────────────────────────────────────────────────
type Props = {
  features: InvitationFeatures
  onChange: (key: keyof InvitationFeatures, value: boolean) => void
}

// ─── 토글 스위치 (CSS 애니메이션) ─────────────────────────────
type SwitchProps = { on: boolean }

function ToggleSwitch({ on }: SwitchProps) {
  return (
    <span
      className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: on ? '#C4607A' : '#D9D9D9' }}
    >
      {/* 썸 — translateX로 슬라이드, CSS transition 적용 */}
      <span
        className="absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white transition-transform duration-200"
        style={{
          left:      '3px',
          transform: on ? 'translateX(16px)' : 'translateX(0)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      />
    </span>
  )
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function FeatureToggle({ features, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {FEATURE_ITEMS.map(({ key, icon, label }) => {
        const on = features[key]
        return (
          <button
            key={key}
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={() => onChange(key, !on)}
            className="flex items-center justify-between rounded-lg border border-[#EEE0D8]
                       bg-[#FFFAF8] px-3 py-2.5 text-left transition-colors duration-150
                       hover:border-[#E8C8C0] hover:bg-[#FFF5F2]"
          >
            <span className="flex items-center gap-2 font-['Gowun_Dodum',sans-serif] text-[13px] text-[#4A2C2C]">
              <span aria-hidden="true">{icon}</span>
              {label}
            </span>
            <ToggleSwitch on={on} />
          </button>
        )
      })}
    </div>
  )
}
