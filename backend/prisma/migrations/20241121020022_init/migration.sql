/*
  Warnings:

  - You are about to drop the column `dicomid` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `docor` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `examdetail` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `pspnumber` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `examdate` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `examtime` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `inputter` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `ivrname` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `memo` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `ptid` on the `Schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_ptid_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "dicomid",
DROP COLUMN "docor",
DROP COLUMN "examdetail",
DROP COLUMN "pspnumber",
ADD COLUMN     "doctor" TEXT,
ALTER COLUMN "modality" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "examdate",
DROP COLUMN "examtime",
DROP COLUMN "inputter",
DROP COLUMN "ivrname",
DROP COLUMN "memo",
DROP COLUMN "ptid",
ADD COLUMN     "modality" TEXT,
ADD COLUMN     "ptnumber" INTEGER,
ADD COLUMN     "scheduledate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE SET NULL ON UPDATE CASCADE;
