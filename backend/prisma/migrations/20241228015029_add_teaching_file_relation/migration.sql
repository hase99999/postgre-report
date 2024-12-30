-- CreateTable
CREATE TABLE "TeachingFile" (
    "id" SERIAL NOT NULL,
    "site" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "ptnumber" INTEGER NOT NULL,
    "dicomid" INTEGER NOT NULL,
    "agesex" TEXT NOT NULL,
    "pthistory" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "registration" TIMESTAMP(3) NOT NULL,
    "registname" TEXT NOT NULL,
    "difficultylevel" INTEGER NOT NULL,
    "pathology" TEXT NOT NULL,
    "publication" BOOLEAN NOT NULL,

    CONSTRAINT "TeachingFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeachingFile" ADD CONSTRAINT "TeachingFile_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
