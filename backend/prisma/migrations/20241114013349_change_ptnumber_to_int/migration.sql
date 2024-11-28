/*
  Warnings:

  - You are about to alter the column `ptnumber` on the `Ptinfo` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `ptnumber` on the `Report` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `ptid` on the `Schedule` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_ptnumber_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_ptid_fkey";

-- AlterTable
ALTER TABLE "Ptinfo" ALTER COLUMN "ptnumber" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "ptnumber" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "ptid" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ptid_fkey" FOREIGN KEY ("ptid") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
