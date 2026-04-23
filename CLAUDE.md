# 초대장메이커 (Invite Maker)

모바일 초대장(칠순/돌잔치/생일)을 5분 안에 셀프 제작하고 카카오톡으로 공유하는 서비스.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **스타일**: Tailwind CSS
- **백엔드/DB**: Firebase (Firestore + Analytics)
- **배포**: Vercel
- **이미지 저장**: html2canvas
- **공유**: 카카오 SDK

## 페이지 구조

| 경로 | 역할 |
|------|------|
| `/` | 홈 — 카테고리 선택 진입점 |
| `/make/[category]` | 에디터 — 한 페이지 스크롤 + 실시간 미리보기 |
| `/preview/[id]` | 완성공유 — 카카오공유/링크복사/이미지저장 |
| `/invite/[id]` | 수신자 뷰 — 초대장 열람 전용 |

## 카테고리 & 테마

**카테고리** (추후 확장 예정)
- `chilsung` — 칠순
- `doljanchi` — 돌잔치
- `birthday` — 생일

**테마**
- `rose` / `gold` / `sage` / `mauve`

## Firestore 데이터 구조

```
invitations/[id]/
├── category       string    // chilsung | doljanchi | birthday
├── theme          string    // rose | gold | sage | mauve
├── name           string    // 주인공 이름 (최대 10자)
├── date           string    // 행사 날짜 (ISO 형식)
├── time           string    // 행사 시간
├── placeName      string    // 장소명 (최대 20자)
├── placeAddress   string    // 장소 주소 (카카오 주소 API)
├── message        string    // 추가 메시지 (최대 100자, 선택)
├── createdAt      timestamp
└── viewCount      number
```

## 입력 유효성 규칙

| 필드 | 필수 | 제약 |
|------|------|------|
| 주인공 이름 | 필수 | 최대 10자 |
| 날짜 | 필수 | 과거 날짜 불가 |
| 시간 | 필수 | — |
| 장소명 | 필수 | 최대 20자 |
| 장소 주소 | 필수 | 카카오 주소 API 연동 |
| 추가 메시지 | 선택 | 최대 100자 |

## Firebase Analytics 이벤트

| 이벤트명 | 트리거 |
|----------|--------|
| `select_category` | 카테고리 선택 |
| `select_theme` | 테마 선택 |
| `complete_editor` | 에디터 완성(저장) |
| `share_kakao` | 카카오톡 공유 |
| `copy_link` | 링크 복사 |
| `save_image` | 이미지 저장 |
| `view_invitation` | 수신자 뷰 진입 |

## 레이아웃 원칙

- **모바일 우선** 반응형 설계
- **PC**: 좌(에디터 폼) / 우(실시간 미리보기) 2단 분할
- **에디터**: 한 페이지 스크롤, 실시간 미리보기 동기화
- **회원가입 없음** — 비회원 제작 전용

## 개발 커맨드

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 환경 변수

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_KAKAO_JS_KEY
NEXT_PUBLIC_KAKAO_ADDRESS_API_KEY
```

## 주요 구현 가이드라인

- Firestore 읽기/쓰기는 `lib/firebase/` 아래 함수로 캡슐화, 페이지/컴포넌트에서 직접 호출 금지
- html2canvas 캡처 대상은 수신자 뷰(`/invite/[id]`)와 동일한 DOM 구조 사용
- 카카오 SDK는 `_app` 초기화 없이 필요한 페이지에서 lazy load
- Analytics 이벤트는 `lib/analytics.ts`의 래퍼 함수로만 호출
- 날짜 비교는 항상 KST 기준으로 처리 (`Asia/Seoul`)


## 디렉토리 구조

src/
├── app/
│   ├── page.tsx                  # 홈
│   ├── make/[category]/
│   │   └── page.tsx              # 에디터 (CSR)
│   ├── preview/[id]/
│   │   └── page.tsx              # 공유 화면
│   └── invite/[id]/
│       └── page.tsx              # 수신자 뷰 (SSR 필수 — OG 태그)
├── components/
│   ├── editor/                   # 사이드바, 테마선택, 토글
│   ├── invitation/               # 섹션별 초대장 컴포넌트
│   └── ui/                       # Button, Modal, Toggle 공통 UI
├── lib/
│   ├── firebase/
│   │   ├── index.ts              # Firebase 초기화
│   │   ├── invitations.ts        # 초대장 CRUD
│   │   └── rsvp.ts               # RSVP CRUD
│   └── analytics.ts              # 이벤트 래퍼 (직접 호출 금지)
├── hooks/
│   ├── useInvitation.ts          # 에디터 상태 (useReducer)
│   └── useRsvp.ts
└── types/
    └── index.ts                  # InvitationData, RsvpResponse 등


## 에디터 상태 구조 (useInvitation 힌트)

type InvitationState = {
  category: string
  theme: 'rose' | 'gold' | 'sage' | 'mauve'
  name: string
  born: string
  eventType: string
  message: string
  date: string
  time: string
  placeName: string
  placeAddress: string
  deadline: string
  children: { role: string; name: string }[]
  features: {
    showMap: boolean
    showRsvp: boolean
    showFamily: boolean
    showPetals: boolean
  }
}


## Firestore 확장 스키마

invitations/[id]/
├── (기존 필드 유지)
├── features/                     # 섹션 ON/OFF
│   ├── showMap      boolean
│   ├── showRsvp     boolean
│   ├── showFamily   boolean
│   └── showPetals   boolean
├── children         array         # [{ role: string, name: string }]
└── meta/
    ├── expiresAt    timestamp     # createdAt + 90일
    ├── views        number
    └── isPremium    boolean       # Phase 2 결제 후 true

# RSVP 서브컬렉션
invitations/[id]/rsvps/[responseId]/
├── name      string
├── count     number
├── type      "attend" | "absent"
├── phone     string (선택)
└── createdAt timestamp

## 렌더링 전략

| 페이지 | 방식 | 이유 |
|---|---|---|
| `/` | SSG | 정적 홈 |
| `/make/[category]` | CSR | 실시간 인터랙션 |
| `/preview/[id]` | CSR | 공유 팝업 |
| `/invite/[id]` | SSR 필수 | 카카오 OG 태그 동적 생성 |

## 코드 규칙

- TypeScript 필수 — `any` 사용 금지
- 컴포넌트: PascalCase / 함수·변수: camelCase
- 한 파일 300줄 초과 시 분리
- 에러 메시지는 반드시 한국어
- 모든 Firestore 호출 try/catch 필수
- console.log 프로덕션 잔류 금지

## 개발 Phase

| Phase | 범위 |
|---|---|
| Phase 1 (MVP) | 칠순 템플릿, 에디터, RSVP, 공유 URL, Vercel 배포 |
| Phase 2 | 프리미엄 기능, Toss 결제, 워터마크 제거 |
| Phase 3 | 돌잔치·생일 템플릿, 대시보드 |

## 절대 하지 말 것

- .env.local Git 커밋
- Firebase 키 하드코딩
- /invite/[id] 에 CSR 사용 (OG 태그 깨짐)
- 초대장 뷰어 내 배너 광고 삽입
- Firestore 직접 호출 (lib/firebase/ 함수만 사용)