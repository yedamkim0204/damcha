-- CreateTable
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
    "review" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_watchedDate_idx" ON "Movie"("watchedDate");

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleId_key" ON "Book"("googleId");

-- CreateIndex
CREATE INDEX "Book_finishedDate_idx" ON "Book"("finishedDate");

-- CreateIndex
CREATE INDEX "Exhibition_visitDate_idx" ON "Exhibition"("visitDate");
