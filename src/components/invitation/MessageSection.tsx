import type { Theme } from '@/types'

// ─── Props ────────────────────────────────────────────────────
type Props = {
  theme: Theme
  message?: string
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type MessagePalette = {
  bg: string
  text: string
}

const PALETTE: Record<Theme, MessagePalette> = {
  rose:  { bg: '#FFF8FA', text: '#5A2535' },
  gold:  { bg: '#FFFDF6', text: '#4A3510' },
  sage:  { bg: '#F5FBF7', text: '#2A4535' },
  mauve: { bg: '#FDF8FD', text: '#3A1A3A' },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function MessageSection({ theme, message }: Props) {
  if (!message) return null

  const p = PALETTE[theme]

  return (
    <section
      className="px-6 py-8 text-center transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      <p
        className="whitespace-pre-line font-serif text-sm font-light leading-[2.2]"
        style={{ color: p.text }}
      >
        {message}
      </p>
    </section>
  )
}
