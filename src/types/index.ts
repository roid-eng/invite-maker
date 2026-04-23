import type { Timestamp } from 'firebase/firestore'

// ─── 리터럴 유니온 ────────────────────────────────────────────
export type Theme = 'rose' | 'gold' | 'sage' | 'mauve'
export type Category = 'chilsung' | 'doljanchi' | 'birthday'

// ─── 보조 타입 ────────────────────────────────────────────────
export type InvitationFeatures = {
  showMap: boolean
  showRsvp: boolean
  showFamily: boolean
  showPetals: boolean
}

export type ChildInfo = {
  role: string
  name: string
}

export type InvitationMeta = {
  expiresAt: Timestamp   // createdAt + 90일
  views: number
  isPremium: boolean     // Phase 2 결제 후 true
}

// ─── 핵심 도메인 타입 ─────────────────────────────────────────
export type InvitationData = {
  id?: string            // Firestore 문서 ID (읽기 시 주입)
  category: Category
  theme: Theme
  name: string           // 주인공 이름, 최대 10자
  date: string           // ISO 형식 (YYYY-MM-DD)
  time: string           // HH:MM
  placeName: string      // 최대 20자
  placeAddress: string   // 카카오 주소 API 반환값
  message?: string       // 추가 메시지, 최대 100자
  children?: ChildInfo[]
  features?: InvitationFeatures
  meta?: InvitationMeta
  createdAt?: Timestamp
  viewCount?: number
}

// ─── 에디터 상태 (useInvitation 힌트, CLAUDE.md 참조) ─────────
export type InvitationState = {
  category: Category
  theme: Theme
  name: string
  born: string        // 출생 정보 표시 문자열 (예: "1955년생 · 만 70세")
  eventType: string   // 한자 행사 유형 (예: "七旬", "還甲")
  message: string
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  placeName: string
  placeAddress: string
  deadline: string    // RSVP 마감 문자열
  children: ChildInfo[]
  features: InvitationFeatures
}

export type RsvpResponse = {
  id?: string            // Firestore 문서 ID (읽기 시 주입)
  name: string
  count: number
  type: 'attend' | 'absent'
  phone?: string
  createdAt: Timestamp
}
