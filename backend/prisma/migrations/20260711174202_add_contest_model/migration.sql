-- CreateEnum
CREATE TYPE "ContestPlatform" AS ENUM ('LEETCODE', 'CODEFORCES', 'CODECHEF', 'GFG');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('UPCOMING', 'ONGOING', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Contest" (
    "id" UUID NOT NULL,
    "platform" "ContestPlatform" NOT NULL,
    "contestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "registrationOpen" BOOLEAN,
    "contestType" TEXT,
    "status" "ContestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contest_status_startTime_idx" ON "Contest"("status", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_platform_contestId_key" ON "Contest"("platform", "contestId");
