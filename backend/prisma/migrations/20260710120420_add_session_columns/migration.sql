-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "browser" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "device" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "operatingSystem" TEXT NOT NULL DEFAULT 'Unknown';
