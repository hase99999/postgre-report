-- DropForeignKey
ALTER TABLE "Dicom" DROP CONSTRAINT "Dicom_pt_ID_fkey";

-- AddForeignKey
ALTER TABLE "Dicom" ADD CONSTRAINT "Dicom_pt_ID_fkey" FOREIGN KEY ("pt_ID") REFERENCES "Ptinfo"("ptnumber") ON DELETE RESTRICT ON UPDATE CASCADE;
