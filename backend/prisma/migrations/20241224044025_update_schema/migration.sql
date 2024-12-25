/*
  Warnings:

  - You are about to drop the column `examdate` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `examtime` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `examenddatetime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examstartdatetime` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "examdate",
DROP COLUMN "examtime",
ADD COLUMN     "examenddatetime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "examstartdatetime" TIMESTAMP(3) NOT NULL;
