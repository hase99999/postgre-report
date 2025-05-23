/*
  Warnings:

  - You are about to drop the column `seaquentail` on the `teachingFile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seaquential]` on the table `teachingFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seaquential` to the `teachingFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "teachingFile_seaquentail_key";

-- AlterTable
ALTER TABLE "teachingFile" DROP COLUMN "seaquentail",
ADD COLUMN     "seaquential" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teachingFile_seaquential_key" ON "teachingFile"("seaquential");
