/*
  Warnings:

  - The values [GFG] on the enum `ContestPlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContestPlatform_new" AS ENUM ('LEETCODE', 'CODEFORCES', 'CODECHEF', 'ATCODER');
ALTER TABLE "Contest" ALTER COLUMN "platform" TYPE "ContestPlatform_new" USING ("platform"::text::"ContestPlatform_new");
ALTER TYPE "ContestPlatform" RENAME TO "ContestPlatform_old";
ALTER TYPE "ContestPlatform_new" RENAME TO "ContestPlatform";
DROP TYPE "public"."ContestPlatform_old";
COMMIT;
