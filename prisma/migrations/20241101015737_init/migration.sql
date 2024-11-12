-- CreateTable
CREATE TABLE "Ptinfo" (
    "ptnumber" INTEGER NOT NULL,
    "ptname" TEXT NOT NULL,
    "ptage" INTEGER NOT NULL,
    "bith" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "Ptinfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "examdate" TIMESTAMP(3) NOT NULL,
    "ptnumber" INTEGER NOT NULL,
    "modality" TEXT NOT NULL,
    "docor" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "clinicaldiag" TEXT NOT NULL,
    "imagediag" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "finaldiag" TEXT NOT NULL,
    "interesting" TEXT NOT NULL,
    "inputby" TEXT NOT NULL,
    "inputdate" TIMESTAMP(3) NOT NULL,
    "site" TEXT NOT NULL,
    "inputtime" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "examdetail" TEXT NOT NULL,
    "dicomid" INTEGER NOT NULL,
    "pspnumber" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "docname" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "hostital" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "docid" SERIAL NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("docid")
);

-- CreateTable
CREATE TABLE "schedule" (
    "ptid" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "examdate" TIMESTAMP(3) NOT NULL,
    "examtime" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "ivrname" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "inputter" TEXT NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ptinfo_ptnumber_key" ON "Ptinfo"("ptnumber");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ptnumber_fkey" FOREIGN KEY ("ptnumber") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_docor_fkey" FOREIGN KEY ("docor") REFERENCES "Doctor"("docid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_ptid_fkey" FOREIGN KEY ("ptid") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
