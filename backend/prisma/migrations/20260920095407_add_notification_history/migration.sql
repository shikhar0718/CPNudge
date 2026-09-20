-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUBMISSION_3_DAYS', 'SUBMISSION_7_DAYS', 'SUBMISSION_30_DAYS', 'CONTEST_14_DAYS', 'CONTEST_30_DAYS');

-- AlterTable
ALTER TABLE "LinkedPlatformAccount" ADD COLUMN     "nextSyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NotificationHistory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" "ContestPlatform" NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationHistory_userId_idx" ON "NotificationHistory"("userId");

-- CreateIndex
CREATE INDEX "NotificationHistory_notificationType_idx" ON "NotificationHistory"("notificationType");

-- CreateIndex
CREATE INDEX "NotificationHistory_sentAt_idx" ON "NotificationHistory"("sentAt");

-- CreateIndex
CREATE INDEX "NotificationHistory_userId_platform_idx" ON "NotificationHistory"("userId", "platform");

-- CreateIndex
CREATE INDEX "LinkedPlatformAccount_nextSyncAt_idx" ON "LinkedPlatformAccount"("nextSyncAt");

-- AddForeignKey
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
