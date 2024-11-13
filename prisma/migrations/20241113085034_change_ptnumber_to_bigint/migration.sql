-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_ptnumber_fkey";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_ptid_fkey";

-- AlterTable
ALTER TABLE "Ptinfo" ALTER COLUMN "ptnumber" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "ptnumber" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "schedule" ALTER COLUMN "ptid" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_ptid_fkey" FOREIGN KEY ("ptid") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
