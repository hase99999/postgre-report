/*
  Warnings:

  - You are about to drop the column `bith` on the `Ptinfo` table. All the data in the column will be lost.
  - Added the required column `employeeNumber` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "employeeNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ptinfo" DROP COLUMN "bith",
ADD COLUMN     "birth" TIMESTAMP(3);
