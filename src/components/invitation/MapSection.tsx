import type { Theme } from '@/types'

// ─── Props ────────────────────────────────────────────────────
type Props = {
  theme: Theme
  placeName: string
  placeAddress: string
  showMap: boolean
}

// ─── 테마별 팔레트 ────────────────────────────────────────────
type MapPalette = {
  bg: string
  pin: string
  ring: string
  lblBg: string
  lblText: string
  lblBorder: string
  navBg: string
}

const PALETTE: Record<Theme, MapPalette> = {
  rose: {
    bg:        '#FFF0F2',
    pin:       '#C4607A',
    ring:      'rgba(196,96,122,0.4)',
    lblBg:     'rgba(255,255,255,0.95)',
    lblText:   '#C4607A',
    lblBorder: 'rgba(196,96,122,0.2)',
    navBg:     '#C4607A',
  },
  gold: {
    bg:        '#FEFAEE',
    pin:       '#C9973A',
    ring:      'rgba(201,151,58,0.4)',
    lblBg:     'rgba(255,255,255,0.95)',
    lblText:   '#8B6010',
    lblBorder: 'rgba(201,151,58,0.2)',
    navBg:     '#C9973A',
  },
  sage: {
    bg:        '#EEF8F2',
    pin:       '#7A9E8A',
    ring:      'rgba(122,158,138,0.4)',
    lblBg:     'rgba(255,255,255,0.95)',
    lblText:   '#3A6A50',
    lblBorder: 'rgba(122,158,138,0.2)',
    navBg:     '#7A9E8A',
  },
  mauve: {
    bg:        '#F5E8F5',
    pin:       '#9B6B8A',
    ring:      'rgba(155,107,138,0.4)',
    lblBg:     'rgba(255,255,255,0.95)',
    lblText:   '#6A3A6A',
    lblBorder: 'rgba(155,107,138,0.2)',
    navBg:     '#9B6B8A',
  },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function MapSection({ theme, placeName, placeAddress, showMap }: Props) {
  if (!showMap) return null

  const p = PALETTE[theme]

  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(
    [placeName, placeAddress].filter(Boolean).join(' '),
  )}`

  return (
    <div
      className="relative h-[150px] overflow-hidden transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      {/* CSS 그리드 배경 — 이미지 없이 linear-gradient 2중 레이어로 구현 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(150,100,100,0.08) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(150,100,100,0.08) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '28px 28px',
        }}
      />

      {/* 핀 + 레이블 — 중앙 기준 65% 위로 이동하여 핀 꼬리가 정중앙에 위치 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[65%] text-center">
        <div className="relative inline-block">
          {/* 핀 마커: border-radius 50%50%50%0 + rotate(-45deg) = 물방울 핀 형태 */}
          <div
            className="mx-auto h-[18px] w-[18px]"
            style={{
              backgroundColor: p.pin,
              borderRadius:    '50% 50% 50% 0',
              transform:       'rotate(-45deg)',
            }}
          />

          {/* 링 파동 애니메이션 */}
          <div
            aria-hidden="true"
            className="absolute"
            style={{
              top:             '-4px',
              left:            '-4px',
              width:           '26px',
              height:          '26px',
              borderRadius:    '50%',
              border:          `1px solid ${p.ring}`,
              animationName:           'mapRing',
              animationDuration:       '2s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
            }}
          />
        </div>

        {/* 장소명 레이블 */}
        <div
          className="mt-2 whitespace-nowrap rounded px-2 py-0.5 font-dodum text-[10px]"
          style={{
            backgroundColor: p.lblBg,
            color:           p.lblText,
            border:          `1px solid ${p.lblBorder}`,
          }}
        >
          {placeName}
        </div>
      </div>

      {/* 길찾기 버튼 — 카카오맵 검색 URL */}
      <a
        href={kakaoMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 right-2.5 rounded-[14px] px-3 py-1.5
                   font-myeongjo text-[11px] font-bold text-white
                   transition-opacity hover:opacity-85 active:opacity-70"
        style={{ backgroundColor: p.navBg }}
      >
        길찾기 →
      </a>
    </div>
  )
}
