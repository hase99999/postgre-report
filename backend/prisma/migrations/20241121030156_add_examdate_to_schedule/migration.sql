/*
  Warnings:

  - You are about to drop the column `modality` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledate` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "modality",
DROP COLUMN "scheduledate",
ADD COLUMN     "examdate" TIMESTAMP(3),
ADD COLUMN     "examtime" INTEGER,
ADD COLUMN     "inputter" TEXT,
ADD COLUMN     "ivrname" TEXT,
ADD COLUMN     "memo" TEXT;
