/*
  Warnings:

  - You are about to drop the column `device` on the `Session` table. All the data in the column will be lost.
  - Added the required column `deviceInfo` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "device",
ADD COLUMN     "deviceInfo" TEXT NOT NULL,
ADD COLUMN     "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "browser" DROP DEFAULT,
ALTER COLUMN "operatingSystem" DROP DEFAULT;
