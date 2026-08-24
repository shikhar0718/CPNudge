-- AlterTable
ALTER TABLE "LinkedPlatformAccount" ADD COLUMN     "lastContestParticipationDate" TIMESTAMP(3),
ADD COLUMN     "lastSubmissionActivityDate" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulSyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SubmissionActivity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" "ContestPlatform" NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestParticipationActivity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" "ContestPlatform" NOT NULL,
    "contestName" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "participatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestParticipationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionActivity_userId_activityDate_idx" ON "SubmissionActivity"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "SubmissionActivity_userId_platform_idx" ON "SubmissionActivity"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionActivity_userId_platform_activityDate_key" ON "SubmissionActivity"("userId", "platform", "activityDate");

-- CreateIndex
CREATE INDEX "ContestParticipationActivity_userId_participatedAt_idx" ON "ContestParticipationActivity"("userId", "participatedAt");

-- CreateIndex
CREATE INDEX "ContestParticipationActivity_userId_platform_idx" ON "ContestParticipationActivity"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "ContestParticipationActivity_userId_platform_contestId_key" ON "ContestParticipationActivity"("userId", "platform", "contestId");

-- AddForeignKey
ALTER TABLE "SubmissionActivity" ADD CONSTRAINT "SubmissionActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipationActivity" ADD CONSTRAINT "ContestParticipationActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
