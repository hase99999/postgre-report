/*
  Warnings:

  - You are about to drop the column `hostital` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hospital` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_ptid_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "hostital",
ADD COLUMN     "hospital" TEXT NOT NULL;

-- DropTable
DROP TABLE "schedule";

-- CreateTable
CREATE TABLE "Schedule" (
    "ptid" BIGINT NOT NULL,
    "id" SERIAL NOT NULL,
    "examdate" TIMESTAMP(3) NOT NULL,
    "examtime" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "ivrname" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "inputter" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ptid_fkey" FOREIGN KEY ("ptid") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
