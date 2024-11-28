-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_docor_fkey";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "docor" SET DATA TYPE TEXT;
