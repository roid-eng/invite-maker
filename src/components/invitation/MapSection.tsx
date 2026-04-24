import type { Theme } from '@/types'

type Props = {
  theme:        Theme
  placeName:    string
  placeAddress: string
  showMap:      boolean
}

type MapPalette = {
  bg:        string
  grid:      string
  road:      string
  roadSub:   string
  block:     string
  blockAlt:  string
  pin:       string
  pinGlow:   string
  ring:      string
  lblBg:     string
  lblText:   string
  lblBorder: string
  navBg:     string
}

const PALETTE: Record<Theme, MapPalette> = {
  rose: {
    bg:        '#F0E8EC',
    grid:      'rgba(180,120,140,0.09)',
    road:      'rgba(255,255,255,0.88)',
    roadSub:   'rgba(255,255,255,0.60)',
    block:     'rgba(215,175,188,0.32)',
    blockAlt:  'rgba(195,225,208,0.34)',
    pin:       '#C4607A',
    pinGlow:   'rgba(196,96,122,0.42)',
    ring:      'rgba(196,96,122,0.28)',
    lblBg:     '#ffffff',
    lblText:   '#C4607A',
    lblBorder: 'rgba(196,96,122,0.22)',
    navBg:     '#C4607A',
  },
  gold: {
    bg:        '#EEE6D8',
    grid:      'rgba(160,130,80,0.09)',
    road:      'rgba(255,255,255,0.88)',
    roadSub:   'rgba(255,255,255,0.60)',
    block:     'rgba(215,190,135,0.32)',
    blockAlt:  'rgba(190,218,200,0.34)',
    pin:       '#C9973A',
    pinGlow:   'rgba(201,151,58,0.42)',
    ring:      'rgba(201,151,58,0.28)',
    lblBg:     '#ffffff',
    lblText:   '#8B6010',
    lblBorder: 'rgba(201,151,58,0.22)',
    navBg:     '#C9973A',
  },
  sage: {
    bg:        '#DFF0E8',
    grid:      'rgba(80,130,100,0.09)',
    road:      'rgba(255,255,255,0.88)',
    roadSub:   'rgba(255,255,255,0.60)',
    block:     'rgba(155,205,175,0.32)',
    blockAlt:  'rgba(200,225,215,0.34)',
    pin:       '#7A9E8A',
    pinGlow:   'rgba(122,158,138,0.42)',
    ring:      'rgba(122,158,138,0.28)',
    lblBg:     '#ffffff',
    lblText:   '#3A6A50',
    lblBorder: 'rgba(122,158,138,0.22)',
    navBg:     '#7A9E8A',
  },
  mauve: {
    bg:        '#E6D5EA',
    grid:      'rgba(140,100,150,0.09)',
    road:      'rgba(255,255,255,0.88)',
    roadSub:   'rgba(255,255,255,0.60)',
    block:     'rgba(195,158,205,0.32)',
    blockAlt:  'rgba(193,218,205,0.34)',
    pin:       '#9B6B8A',
    pinGlow:   'rgba(155,107,138,0.42)',
    ring:      'rgba(155,107,138,0.28)',
    lblBg:     '#ffffff',
    lblText:   '#6A3A6A',
    lblBorder: 'rgba(155,107,138,0.22)',
    navBg:     '#9B6B8A',
  },
}

export default function MapSection({ theme, placeName, placeAddress, showMap }: Props) {
  if (!showMap) return null

  const p = PALETTE[theme]
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(placeAddress || placeName)}`

  return (
    <div
      className="relative h-[160px] overflow-hidden transition-[background] duration-500"
      style={{ backgroundColor: p.bg }}
    >
      {/* ── 지도 배경 레이어 ── */}
      <div aria-hidden="true" className="absolute inset-0">

        {/* 격자 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              `linear-gradient(${p.grid} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${p.grid} 1px, transparent 1px)`,
            ].join(', '),
            backgroundSize: '22px 22px',
          }}
        />

        {/* 도시 블록 */}
        <div className="absolute rounded-sm" style={{ top: 6,    left: 6,    width: 84,  height: 48, backgroundColor: p.block    }} />
        <div className="absolute rounded-sm" style={{ top: 6,    left: 103,  width: 50,  height: 40, backgroundColor: p.blockAlt }} />
        <div className="absolute rounded-sm" style={{ top: 6,    right: 6,   width: 80,  height: 52, backgroundColor: p.block    }} />
        <div className="absolute rounded-sm" style={{ top: 62,   right: 6,   width: 56,  height: 38, backgroundColor: p.blockAlt }} />
        <div className="absolute rounded-sm" style={{ bottom: 6, left: 6,    width: 90,  height: 42, backgroundColor: p.blockAlt }} />
        <div className="absolute rounded-sm" style={{ bottom: 6, left: 110,  width: 46,  height: 34, backgroundColor: p.block    }} />
        <div className="absolute rounded-sm" style={{ bottom: 6, right: 6,   width: 72,  height: 44, backgroundColor: p.block    }} />

        {/* 보조 도로 */}
        <div className="absolute inset-y-0" style={{ right: '26%',  width: 7,  backgroundColor: p.roadSub }} />
        <div className="absolute inset-x-0" style={{ bottom: '28%', height: 6, backgroundColor: p.roadSub }} />

        {/* 메인 도로 — 핀이 교차점에 위치 */}
        <div className="absolute inset-x-0" style={{ top: '50%', marginTop: -8,  height: 16, backgroundColor: p.road }} />
        <div className="absolute inset-y-0" style={{ left: '50%', marginLeft: -8, width: 16,  backgroundColor: p.road }} />
      </div>

      {/* ── 말풍선 + 핀 마커 (핀 중심 = 도로 교차점) ── */}
      <div
        className="absolute text-center"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, calc(-100% + 13px))', zIndex: 10 }}
      >
        {/* 말풍선 레이블 */}
        <div className="relative mb-1.5 inline-block">
          <div
            className="whitespace-nowrap rounded-lg px-3 py-[5px] font-dodum text-[11px] font-bold"
            style={{
              backgroundColor: p.lblBg,
              color:           p.lblText,
              border:          `1.5px solid ${p.lblBorder}`,
              boxShadow:       '0 3px 10px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {placeName}
          </div>
          {/* 말풍선 아래 삼각형 (테두리 색) */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: -8, display: 'block', width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: `8px solid ${p.lblBorder}` }}
          />
          {/* 말풍선 아래 삼각형 (채우기 색) */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: -6, display: 'block', width: 0, height: 0,
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: `6px solid ${p.lblBg}` }}
          />
        </div>

        {/* 원형 핀 마커 */}
        <div className="relative mx-auto" style={{ width: 28, height: 28 }}>
          {/* 링 파동 애니메이션 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              border:                  `1.5px solid ${p.ring}`,
              animationName:           'mapRing',
              animationDuration:       '2s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
            }}
          />
          {/* 핀 원 + 내부 흰 점 */}
          <div
            className="absolute inset-[1px] flex items-center justify-center rounded-full"
            style={{
              backgroundColor: p.pin,
              boxShadow:       `0 4px 14px ${p.pinGlow}, 0 2px 5px rgba(0,0,0,0.18)`,
            }}
          >
            <div className="rounded-full bg-white opacity-90" style={{ width: 9, height: 9 }} />
          </div>
        </div>
      </div>

      {/* 길찾기 버튼 */}
      <a
        href={kakaoMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 right-2.5 z-10 rounded-[14px] px-3 py-1.5
                   font-myeongjo text-[11px] font-bold text-white
                   transition-opacity hover:opacity-85 active:opacity-70"
        style={{ backgroundColor: p.navBg }}
      >
        길찾기 →
      </a>
    </div>
  )
}
