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

## 배포 시 참고

지금 구조는 로컬 개발용이라 그대로 Vercel에 올라가지 않아요. 클라우드 배포하려면:

- **DB**: SQLite는 서버리스에서 안 돌아가요. [Turso](https://turso.tech) (libSQL, 무료 티어, SQLite 호환) 또는 Vercel Postgres로 이전 필요. `prisma/schema.prisma`의 provider만 바꾸면 됨.
- **사진 업로드**: Vercel은 파일시스템 쓰기 불가. [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)으로 옮기고 `src/lib/uploads.ts`만 교체하면 됨.
- **환경변수**: Vercel 대시보드에서 `TMDB_API_KEY`, `DATABASE_URL` 등록.
