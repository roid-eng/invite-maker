import type { Metadata } from 'next'
import { Nanum_Myeongjo, Gowun_Dodum, Noto_Sans_KR } from 'next/font/google'
import '@/styles/globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets:  ['latin'],
  weight:   ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display:  'swap',
})

const nanumMyeongjo = Nanum_Myeongjo({
  subsets:  ['latin'],
  weight:   ['400', '700', '800'],
  variable: '--font-nanum-myeongjo',
  display:  'swap',
})

const gowunDodum = Gowun_Dodum({
  subsets:  ['latin'],
  weight:   ['400'],
  variable: '--font-gowun-dodum',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    default:  '초대장메이커',
    template: '%s | 초대장메이커',
  },
  description: '칠순·돌잔치·생일 모바일 초대장을 5분 만에 직접 만들고 카카오톡으로 공유하세요.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${nanumMyeongjo.variable} ${gowunDodum.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
