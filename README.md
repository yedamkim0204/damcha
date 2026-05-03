# My Archive

내 영화 · 책 · 전시 감상 기록 사이트.

## 기능

- 영화, 책, 전시 각각의 기록 (별점 1~5, 태그, 날짜, 감상평)
- TMDB API로 영화 검색 → 표지/감독/개봉년도 자동 채움
- Google Books API로 책 검색 → 표지/저자/출판사/ISBN 자동 채움
- 전시는 직접 입력 + 사진 업로드 (최대 8MB · jpg/png/webp/gif)
- 통합 검색 (제목, 감독/저자/장소, 태그, 감상평)
- 대시보드: 올해 본 개수, 평균 별점, 최근 기록

## 셋업

### 1. TMDB API 키 등록

영화 검색을 쓰려면 TMDB 키가 필요해요. (책/전시는 키 없이도 동작)

1. https://www.themoviedb.org/settings/api 에서 API Read Access Token이 아니라 **API Key (v3 auth)** 를 복사
2. 프로젝트 루트에 `.env.local` 파일을 만들고:

```
TMDB_API_KEY=여기에_키_붙여넣기
```

### 2. 실행

```powershell
npm run dev
```

브라우저에서 http://localhost:3000 접속.

### 3. (이미 완료됨) DB 초기화

```powershell
npx prisma migrate dev
```

## 폴더 구조

```
src/
├── app/
│   ├── page.tsx              # 대시보드
│   ├── movies/               # /movies, /movies/new, /movies/[id], /[id]/edit
│   ├── books/                # 동일 구조
│   ├── exhibitions/          # 동일 구조 (사진 업로드)
│   └── search/               # 통합 검색
├── components/               # Nav, StarRating, TagInput, SearchPicker 등
└── lib/
    ├── prisma.ts             # Prisma 싱글톤
    ├── tmdb.ts               # TMDB 클라이언트
    ├── google-books.ts       # Google Books 클라이언트
    ├── uploads.ts            # 사진 업로드/삭제
    └── utils.ts              # 태그·사진 직렬화, 날짜 포맷

prisma/
├── schema.prisma             # Movie / Book / Exhibition 모델
└── dev.db                    # SQLite 데이터베이스 파일

public/uploads/               # 전시 사진 저장 위치
```

## 스택

- Next.js 16 (App Router) + TypeScript + Turbopack
- Tailwind CSS v4
- Prisma 6 + SQLite
- React Server Components / Server Actions
- TMDB · Google Books · lucide-react · zod · date-fns

## 배포 (Vercel + Turso + Vercel Blob)

`src/lib/prisma.ts`와 `src/lib/uploads.ts`가 환경에 따라 자동 분기 — 로컬은 SQLite + 파일시스템, 프로덕션은 Turso + Vercel Blob.

### 1. Turso DB 생성

1. https://turso.tech 가입 → 무료 plan 선택 (카드 X)
2. **Create Database** → 이름 `damcha`, 리전은 `nrt` (도쿄, 한국에서 가까움)
3. **Database URL** 복사 (`libsql://...`)
4. **Generate auth token** → 토큰 복사
5. **Studio** 진입 → SQL 편집기에 `prisma/turso-setup.sql` 전체 붙여넣고 Run

### 2. Vercel 가입 + 임포트

1. https://vercel.com 에서 GitHub로 가입
2. **Add New → Project** → `damcha` 저장소 선택 → Import

### 3. 환경변수 설정 (배포 직전 화면)

| Key | Value |
|---|---|
| `TMDB_API_KEY` | 본인 TMDB v3 API Key |
| `DATABASE_URL` | Turso의 libsql:// URL |
| `DATABASE_AUTH_TOKEN` | Turso 토큰 |
| `BLOB_READ_WRITE_TOKEN` | (다음 단계에서 자동 생성됨) |

### 4. Vercel Blob 추가

Vercel 프로젝트 페이지 → **Storage** 탭 → **Create Database** → **Blob** → 연결.

이러면 `BLOB_READ_WRITE_TOKEN`이 자동으로 환경변수에 추가됨. 그 후 **Redeploy**.

### 5. 끝

배포 URL이 발급됨 (예: `damcha.vercel.app`). 깃 푸시할 때마다 자동 재배포.
