# QR 출퇴근 시스템 v2

Next.js 14 기반의 QR 코드 출퇴근 관리 시스템입니다.

## 🚀 주요 기능

- **카카오 로그인**: OAuth를 통한 간편 로그인
- **QR 코드 출퇴근**: 현장별 QR 코드 스캔으로 출퇴근 기록
- **지오펜싱**: 150m 반경 내에서만 출퇴근 가능
- **관리자 페이지**: 출퇴근 기록 조회, 수정, 삭제
- **일괄 관리**: 체크박스로 여러 기록 선택/삭제
- **급여 계산**: 근무시간 기반 자동 급여 계산

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js v4 (Auth.js)
- **ORM**: Prisma
- **Deployment**: Vercel

## 📋 환경 변수 설정

Vercel에서 다음 환경 변수를 설정해야 합니다:

```env
# NextAuth 설정
AUTH_SECRET=your_auth_secret_here_make_it_long_and_random
NEXTAUTH_URL=https://your-domain.vercel.app

# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 데이터베이스 설정 (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# 기본 현장 설정
NEXT_PUBLIC_DEFAULT_SITE=HQ
```

## 🔧 카카오 개발자 설정

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. 카카오 로그인 활성화
3. Redirect URI 설정: `https://your-domain.vercel.app/api/auth/callback/kakao`
4. 동의 항목 설정: `profile_nickname`, `profile_image`

## 🚀 배포 방법

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 새 프로젝트 생성
3. GitHub 저장소 연결
4. 환경 변수 설정
5. 배포 완료

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일 수정

# 데이터베이스 마이그레이션
npx prisma db push

# 개발 서버 실행
npm run dev
```

## 📱 사용 방법

### 일반 사용자
1. 홈페이지에서 "출근" 또는 "퇴근" 버튼 클릭
2. 카카오 로그인 (최초 1회)
3. 연락처 입력 (최초 1회)
4. QR 코드 스캔 또는 위치 정보 제출
5. 출퇴근 완료

### 관리자
1. `/admin/auth` 접속
2. 비밀번호 입력: `admin`
3. 출퇴근 기록 조회, 수정, 삭제
4. QR 코드 생성

## 🔒 보안 기능

- **지오펜싱**: 현장 150m 반경 내에서만 출퇴근 가능
- **중복 방지**: 같은 날 중복 출퇴근 방지
- **관리자 인증**: 비밀번호 기반 관리자 페이지 접근
- **세션 관리**: JWT 기반 안전한 세션 관리

## 📊 데이터베이스 스키마

### 주요 테이블
- `User`: 사용자 정보 (카카오 계정 연동)
- `Attendance`: 출퇴근 기록
- `Account`: OAuth 계정 정보
- `Session`: 세션 정보

## 🐛 문제 해결

### 빌드 오류
- 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스 연결 상태 확인
- 카카오 개발자 설정 확인

### 로그인 오류
- 카카오 개발자 콘솔에서 Redirect URI 확인
- 동의 항목 설정 확인
- NEXTAUTH_URL이 올바른지 확인

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 브라우저 콘솔 오류 메시지
2. 서버 로그
3. 데이터베이스 연결 상태
4. 환경 변수 설정

---

© 2024 QR 출퇴근 시스템. All rights reserved.
