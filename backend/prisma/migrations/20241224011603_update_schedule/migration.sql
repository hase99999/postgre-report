/*
  Warnings:

  - Made the column `ptnumber` on table `Schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_ptnumber_fkey";

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "ptnumber" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
