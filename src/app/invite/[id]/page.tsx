import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getInvitation, incrementViews } from '@/lib/firebase/invitations'
import InvitationPreview from '@/components/invitation/InvitationPreview'
import ExpiredScreen from '@/components/ui/ExpiredScreen'
import ViewAnalytics from './_components/ViewAnalytics'

// ─── 요청당 1회만 Firestore 조회 (generateMetadata + page 공유) ─
// React cache()는 동일 요청 내에서 중복 호출을 메모이제이션
const fetchInvitation = cache(getInvitation)

type Props = { params: { id: string } }

// ─── 카테고리 → 한국어 레이블 ─────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  chilsung:  '칠순',
  doljanchi: '돌잔치',
  birthday:  '생일',
}

// ─── generateMetadata ─────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchInvitation(params.id).catch(() => null)

  if (!data) {
    return { title: '초대장을 찾을 수 없습니다' }
  }

  const label       = CATEGORY_LABEL[data.category] ?? '행사'
  const title       = `${data.name}님의 ${label} 초대장`
  const description = `${data.date} · ${data.placeName}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type:   'website',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      ['/og/default.png'],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────
export default async function InvitePage({ params }: Props) {
  // Firestore 오류 및 null 모두 notFound() 처리
  const data = await fetchInvitation(params.id).catch(() => null)
  if (!data) notFound()

  // 만료 체크 (KST 불필요 — Firestore Timestamp는 UTC 절대값)
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return <ExpiredScreen />
  }

  // 조회수 증가 — 실패해도 렌더링에 영향 없음
  void incrementViews(params.id).catch(() => undefined)

  return (
    <>
      {/* analytics는 브라우저 전용이므로 분리된 client 컴포넌트로 처리 */}
      <ViewAnalytics id={params.id} />

      <InvitationPreview data={data} isPreview={false} />

      {/* 하단 고정 바 — PC에서도 초대장 너비(430px)에 맞춰 중앙 정렬 */}
      <div
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2
                   border-t border-[#E8D8D0] bg-white/95 px-4 py-3
                   backdrop-blur-sm"
      >
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl
                     bg-[#C4607A] py-3.5 font-myeongjo text-[14px] font-bold
                     text-white shadow-[0_4px_14px_rgba(196,96,122,0.25)]
                     transition-opacity hover:opacity-90 active:opacity-75"
        >
          나도 초대장 만들기
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}
