/*
  Warnings:

  - Changed the type of `seaquentail` on the `teachingFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "teachingFile" DROP COLUMN "seaquentail",
ADD COLUMN     "seaquentail" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teachingFile_seaquentail_key" ON "teachingFile"("seaquentail");
