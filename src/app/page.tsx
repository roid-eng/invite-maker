import type { Metadata } from 'next'
import InvitationPreview from '@/components/invitation/InvitationPreview'
import CategoryCards from './_components/CategoryCards'
import FindInvitation from './_components/FindInvitation'
import type { InvitationData } from '@/types'

// ─── OG 메타데이터 ────────────────────────────────────────────
export const metadata: Metadata = {
  title: '초대장메이커 — 5분 만에 완성하는 모바일 초대장',
  description:
    '칠순·돌잔치·생일 모바일 초대장을 무료로 직접 만들고 카카오톡으로 공유하세요.',
  openGraph: {
    title:       '초대장메이커 — 5분 만에 완성하는 모바일 초대장',
    description: '칠순·돌잔치·생일 모바일 초대장을 무료로 직접 만들고 카카오톡으로 공유하세요.',
    type:        'website',
    images:      [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       '초대장메이커 — 5분 만에 완성하는 모바일 초대장',
    description: '칠순·돌잔치·생일 모바일 초대장을 무료로 직접 만들고 카카오톡으로 공유하세요.',
    images:      ['/og/default.png'],
  },
}

// ─── 데모용 샘플 데이터 ───────────────────────────────────────
const DEMO_DATA: InvitationData = {
  category:     'chilsung',
  theme:        'rose',
  name:         '김 복 순',
  date:         '2026-06-15',
  time:         '12:00',
  placeName:    '그랜드 볼룸',
  placeAddress: '서울특별시 강남구 테헤란로 123',
  message:
    '살아온 날들의 무게만큼\n깊어진 사랑과 지혜로\n어머니의 칠순을 맞이하여\n\n그 귀한 날을 함께 나누고자\n삼가 모시옵나이다.',
  children: [
    { role: '장 남', name: '김민준' },
    { role: '장 녀', name: '김지영' },
  ],
  features: {
    showMap:    false,
    showRsvp:   false,
    showFamily: true,
    showPetals: true,
  },
}

// ─── Page ─────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(170deg, #FFF5F7 0%, #FFFBF0 55%, #FFF5F7 100%)',
      }}
    >
      {/* ── 헤더 ── */}
      <header className="py-5 text-center">
        <p className="font-myeongjo text-[22px] font-extrabold tracking-wide text-[#C4607A]">
          초대<span className="text-[#C9973A]">장</span>메이커
        </p>
        <p className="mt-0.5 font-dodum text-[10px] tracking-widest text-[#C0A0AA]">
          INVITATION MAKER · 무료 모바일 초대장
        </p>
      </header>

      {/* ── 히어로 ── */}
      <section className="px-6 pb-10 text-center">
        {/* 뱃지 */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#FEE9EE] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C4607A]" />
          <span className="font-dodum text-[11px] tracking-wider text-[#C4607A]">
            무료 · 5분 완성 · 카카오톡 공유
          </span>
        </div>

        {/* 메인 카피 */}
        <h1 className="mb-4 font-myeongjo text-[28px] font-extrabold leading-snug tracking-tight text-[#3B0A1F]">
          소중한 날을<br />아름답게 전하세요
        </h1>

        {/* 서브 카피 */}
        <p className="font-dodum text-[14px] leading-relaxed text-[#9E7070]">
          칠순·돌잔치·생일 모바일 초대장을<br />
          직접 만들고 카카오톡으로 공유하세요.
        </p>

        {/* 장식 구분선 */}
        <div className="mx-auto mt-8 flex max-w-[200px] items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#F9C8D4]" />
          <span className="font-myeongjo text-[18px] leading-none text-[#C4607A]">壽</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#F9C8D4]" />
        </div>
      </section>

      {/* ── 카테고리 선택 ── */}
      <section className="px-4 pb-12">
        <p className="mb-5 text-center font-dodum text-[11px] tracking-widest text-[#C0A0AA]">
          어떤 초대장을 만드실 건가요?
        </p>
        <CategoryCards />
      </section>

      {/* ── 초대장 찾기 ── */}
      <FindInvitation />

      {/* ── 데모 미리보기 ── */}
      <section className="pb-16">
        <div className="mb-6 text-center">
          <p className="font-myeongjo text-[18px] font-bold text-[#3B0A1F]">
            이런 초대장이 만들어져요
          </p>
          <p className="mt-1 font-dodum text-[12px] text-[#C0A0AA]">
            실제 샘플 · 칠순 · Rose 테마
          </p>
        </div>

        <InvitationPreview data={DEMO_DATA} isPreview />
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-[#F5E2E8] py-8 text-center">
        <p className="font-dodum text-[11px] text-[#C0A8B0]">
          © 2026 초대장메이커 · 회원가입 없이 무료 제작
        </p>
      </footer>
    </div>
  )
}
