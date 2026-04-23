# 초대장메이커

칠순·돌잔치·생일 모바일 초대장을 5분 만에 셀프 제작하고 카카오톡으로 공유하는 서비스.

**스택**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase · Vercel

---

## 로컬 실행

### 사전 요구 사항

- Node.js 18 이상
- Firebase 프로젝트 (Firestore + Analytics 활성화)
- Kakao 개발자 앱

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성
cp .env.local.example .env.local
# .env.local을 편집해서 실제 값을 채워 넣습니다

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## Firebase 프로젝트 연결

### 1. Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가**
2. Google Analytics 연동 선택 (Analytics 이벤트 사용 시 필수)

### 2. Firestore 활성화

1. 콘솔 좌측 메뉴 **Firestore Database** → **데이터베이스 만들기**
2. 보안 규칙: 초기에는 **테스트 모드**로 시작, 배포 전 아래 규칙으로 교체

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /invitations/{id} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['category','theme','name','date','time','placeName','placeAddress']);
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['viewCount']);
    }
    match /invitations/{id}/rsvps/{rsvpId} {
      allow read, create: if true;
    }
  }
}
```

### 3. Firebase Analytics 활성화

Firebase 콘솔 좌측 메뉴 **Analytics** → 활성화 (Google Analytics 연동 필요)

### 4. 앱 등록 및 설정값 복사

1. 콘솔 **프로젝트 설정** (톱니바퀴) → **내 앱** → **앱 추가** → 웹(`</>`)
2. 앱 닉네임 입력 후 **앱 등록**
3. `firebaseConfig` 객체의 값을 `.env.local`에 복사

---

## 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local`을 만들고 각 값을 채웁니다.

| 변수 | 출처 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 콘솔 | Firebase 앱 API 키 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 콘솔 | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 콘솔 | Firebase 프로젝트 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 콘솔 | `<project-id>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 콘솔 | Cloud Messaging 발신자 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 콘솔 | Firebase 앱 ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase 콘솔 | Analytics 측정 ID (`G-XXXXXXXX`) |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Kakao 개발자센터 | JavaScript 키 (카카오톡 공유) |
| `NEXT_PUBLIC_KAKAO_ADDRESS_API_KEY` | Kakao 개발자센터 | REST API 키 (주소 검색) |

> **주의**: `.env.local`은 절대 Git에 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

### Kakao 개발자 앱 설정

1. [Kakao 개발자센터](https://developers.kakao.com) → **내 애플리케이션** → **애플리케이션 추가하기**
2. **앱 키** 탭에서 **JavaScript 키**와 **REST API 키** 복사
3. **플랫폼** → **Web** → 사이트 도메인 등록 (예: `https://your-domain.vercel.app`)
4. **카카오 로그인** → **활성화** (공유 기능에 필요)
5. **카카오톡 공유** → 활성화

---

## Vercel 배포

### 1. GitHub 저장소 연결

```bash
# Git 초기화 및 첫 커밋
git init
git add .
git commit -m "initial commit"

# GitHub 원격 저장소 연결
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) → **Add New Project**
2. GitHub 저장소 선택 → **Import**
3. Framework Preset: **Next.js** (자동 감지됨)

### 3. 환경 변수 등록

Vercel 프로젝트 **Settings** → **Environment Variables**에서
`.env.local`의 모든 키-값 쌍을 등록합니다.

- Environment: **Production**, **Preview**, **Development** 모두 체크

### 4. 배포

```bash
# 이후 변경사항은 git push만으로 자동 배포
git push origin main
```

---

## 배포 전 체크리스트

### 필수

- [ ] `.env.local`의 모든 환경 변수가 Vercel에 등록되어 있음
- [ ] Firebase Firestore 보안 규칙이 프로덕션용으로 교체됨
- [ ] Kakao 개발자 앱의 플랫폼 도메인에 Vercel 도메인이 등록됨
- [ ] `npm run build` 로컬 빌드 성공 확인
- [ ] `npm run lint` 오류 없음 확인

### Firebase 보안

- [ ] Firestore 보안 규칙에서 테스트 모드(전체 허용) 해제
- [ ] Firebase 콘솔 **앱 체크** 활성화 검토 (봇 차단)
- [ ] Firebase 콘솔에서 승인된 도메인 목록에 Vercel 도메인 추가
  - Authentication → Settings → 승인된 도메인

### 기능 확인

- [ ] 홈(`/`) — 카테고리 카드 클릭 → 에디터 이동
- [ ] 에디터(`/make/chilsung`) — 필드 입력 → 완성하기 → 공유 페이지 이동
- [ ] 공유(`/preview/[id]`) — 링크 복사 / 카카오 공유 / 이미지 저장 동작
- [ ] 수신자 뷰(`/invite/[id]`) — OG 미리보기 (카카오톡 미리 보내서 확인)

---

## 개발 커맨드

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```
