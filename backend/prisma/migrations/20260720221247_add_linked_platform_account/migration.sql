-- CreateTable
CREATE TABLE "LinkedPlatformAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "platform" "ContestPlatform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedPlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedPlatformAccount_userId_platform_key" ON "LinkedPlatformAccount"("userId", "platform");

-- AddForeignKey
ALTER TABLE "LinkedPlatformAccount" ADD CONSTRAINT "LinkedPlatformAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
