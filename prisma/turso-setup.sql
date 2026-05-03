-- DAMCHA — Turso 초기 설정 스크립트
-- 사용법: Turso 웹 콘솔(turso.tech의 Studio) SQL 편집기에 전체 복사 → Run
-- 한 번만 실행하면 됨. 이후 스키마 변경 시 추가 마이그레이션을 별도로 적용.

CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tmdbId" INTEGER,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "director" TEXT,
    "releaseYear" INTEGER,
    "posterUrl" TEXT,
    "watchedDate" DATETIME NOT NULL,
    "rating" INTEGER NOT NULL,
    "oneLine" TEXT,
    "memorable" TEXT,
    "review" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleId" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "isbn" TEXT,
    "coverUrl" TEXT,
    "finishedDate" DATETIME NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Exhibition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "artist" TEXT,
    "visitDate" DATETIME NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "photos" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");
CREATE INDEX "Movie_watchedDate_idx" ON "Movie"("watchedDate");

CREATE UNIQUE INDEX "Book_googleId_key" ON "Book"("googleId");
CREATE INDEX "Book_finishedDate_idx" ON "Book"("finishedDate");

CREATE INDEX "Exhibition_visitDate_idx" ON "Exhibition"("visitDate");
