/*
  Warnings:

  - A unique constraint covering the columns `[employeeNumber]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Dicom" (
    "id" SERIAL NOT NULL,
    "pt_ID" INTEGER NOT NULL,
    "seq_num" INTEGER NOT NULL,
    "ex_date" TIMESTAMP(3) NOT NULL,
    "modality" TEXT NOT NULL,
    "image_num" INTEGER NOT NULL,
    "seriespath" TEXT NOT NULL,

    CONSTRAINT "Dicom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_employeeNumber_key" ON "Doctor"("employeeNumber");

-- AddForeignKey
ALTER TABLE "Dicom" ADD CONSTRAINT "Dicom_pt_ID_fkey" FOREIGN KEY ("pt_ID") REFERENCES "Ptinfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
