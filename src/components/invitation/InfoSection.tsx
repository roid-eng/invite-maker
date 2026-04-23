import type { Theme } from '@/types'

// ─── Props ────────────────────────────────────────────────────
type Props = {
  theme: Theme
  date: string
  time: string
  placeName: string
  placeAddress: string
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type InfoPalette = {
  bg: string
  title: string
  cardBg: string
  cardBorder: string
  iconBg: string
  label: string
  value: string
}

const PALETTE: Record<Theme, InfoPalette> = {
  rose: {
    bg:         '#FFF4F6',
    title:      '#C4607A',
    cardBg:     '#FFFFFF',
    cardBorder: '#F5D0D8',
    iconBg:     '#FFE8EC',
    label:      '#C4607A',
    value:      '#3D1525',
  },
  gold: {
    bg:         '#FEFAEE',
    title:      '#9B7220',
    cardBg:     '#FFFFFF',
    cardBorder: '#F0DCA0',
    iconBg:     '#FEF0C0',
    label:      '#9B7220',
    value:      '#3D2A05',
  },
  sage: {
    bg:         '#EEF8F2',
    title:      '#4A7A60',
    cardBg:     '#FFFFFF',
    cardBorder: '#C8E5D5',
    iconBg:     '#D8EEE2',
    label:      '#4A7A60',
    value:      '#1A3525',
  },
  mauve: {
    bg:         '#F8F0F8',
    title:      '#7A4A7A',
    cardBg:     '#FFFFFF',
    cardBorder: '#E2C8E5',
    iconBg:     '#EDD8EE',
    label:      '#7A4A7A',
    value:      '#2A0A2A',
  },
}

// ─── 카드 서브컴포넌트 ────────────────────────────────────────
type CardProps = {
  icon: string
  label: string
  value: string
  sub: string
  p: InfoPalette
}

function InfoCard({ icon, label, value, sub, p }: CardProps) {
  return (
    <div
      className="mb-2.5 flex items-start gap-3 rounded-xl p-4 transition-colors duration-300"
      style={{ backgroundColor: p.cardBg, border: `1px solid ${p.cardBorder}` }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ backgroundColor: p.iconBg }}
      >
        {icon}
      </div>
      <div>
        <p
          className="mb-0.5 font-dodum text-[10px] tracking-[2px] opacity-60"
          style={{ color: p.label }}
        >
          {label}
        </p>
        <p className="text-sm font-bold leading-snug" style={{ color: p.value }}>
          {value}
        </p>
        <p className="mt-0.5 font-dodum text-[11px] opacity-50" style={{ color: p.value }}>
          {sub}
        </p>
      </div>
    </div>
  )
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function InfoSection({
  theme,
  date,
  time,
  placeName,
  placeAddress,
}: Props) {
  const p = PALETTE[theme]

  return (
    <section
      className="px-5 py-7 transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      <p
        className="mb-5 text-center font-dodum text-[10px] tracking-[5px] opacity-60"
        style={{ color: p.title }}
      >
        ✦ 행사 안내
      </p>

      <InfoCard icon="📅" label="일 시" value={date}      sub={time}         p={p} />
      <InfoCard icon="🏛" label="장 소" value={placeName} sub={placeAddress} p={p} />
    </section>
  )
}
