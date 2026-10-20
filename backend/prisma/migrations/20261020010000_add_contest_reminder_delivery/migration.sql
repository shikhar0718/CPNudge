-- Add contest reminder identity and an atomic pending claim state to the
-- existing notification history table. Existing inactivity rows remain valid:
-- their contestId and reminderBeforeMinutes values are NULL and retain the
-- existing SENT default. PostgreSQL permits multiple NULL values in the
-- composite key, so inactivity history is not made accidentally unique.
ALTER TYPE "NotificationType" ADD VALUE 'CONTEST_REMINDER';

CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT');

ALTER TABLE "NotificationHistory"
    ADD COLUMN "contestId" UUID,
    ADD COLUMN "reminderBeforeMinutes" INTEGER,
    ADD COLUMN "deliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'SENT',
    ADD COLUMN "claimedAt" TIMESTAMP(3),
    ALTER COLUMN "sentAt" DROP NOT NULL;

CREATE INDEX "NotificationHistory_contestId_idx" ON "NotificationHistory"("contestId");

CREATE UNIQUE INDEX "NotificationHistory_userId_contestId_notificationType_reminderBeforeMinutes_key"
    ON "NotificationHistory"("userId", "contestId", "notificationType", "reminderBeforeMinutes");

ALTER TABLE "NotificationHistory"
    ADD CONSTRAINT "NotificationHistory_contestId_fkey"
    FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
