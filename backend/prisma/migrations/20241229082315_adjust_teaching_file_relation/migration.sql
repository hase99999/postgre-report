/*
  Warnings:

  - You are about to drop the `TeachingFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeachingFile" DROP CONSTRAINT "TeachingFile_ptnumber_fkey";

-- DropTable
DROP TABLE "TeachingFile";

-- CreateTable
CREATE TABLE "teachingFile" (
    "id" SERIAL NOT NULL,
    "seaquentail" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "ptnumber" INTEGER NOT NULL,
    "dicomid" INTEGER NOT NULL,
    "agesex" TEXT NOT NULL,
    "pthistory" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "registration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registname" TEXT NOT NULL,
    "difficultylevel" INTEGER NOT NULL,
    "pathology" TEXT NOT NULL,
    "publication" BOOLEAN NOT NULL,

    CONSTRAINT "teachingFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachingFile_seaquentail_key" ON "teachingFile"("seaquentail");

-- AddForeignKey
ALTER TABLE "teachingFile" ADD CONSTRAINT "teachingFile_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
