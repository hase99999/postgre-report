import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/reports/${id}`);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [id]);

  if (!report) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Report Detail</h1>
      <p><strong>ID:</strong> {report.id}</p>
      <p><strong>Exam Date:</strong> {report.examdate}</p>
      <p><strong>Patient Number:</strong> {report.ptnumber}</p>
      <p><strong>Modality:</strong> {report.modality}</p>
      <p><strong>Doctor:</strong> {report.docor}</p>
      <p><strong>Department:</strong> {report.department}</p>
      <p><strong>Clinical Diagnosis:</strong> {report.clinicaldiag}</p>
      <p><strong>Image Diagnosis:</strong> {report.imagediag}</p>
      <p><strong>Report:</strong> {report.report}</p>
      <p><strong>Final Diagnosis:</strong> {report.finaldiag}</p>
      <p><strong>Interesting:</strong> {report.interesting}</p>
      <p><strong>Input By:</strong> {report.inputby}</p>
      <p><strong>Input Date:</strong> {report.inputdate}</p>
      <p><strong>Site:</strong> {report.site}</p>
      <p><strong>Input Time:</strong> {report.inputtime}</p>
      <p><strong>Exam Detail:</strong> {report.examdetail}</p>
      <p><strong>DICOM ID:</strong> {report.dicomid}</p>
      <p><strong>PSP Number:</strong> {report.pspnumber}</p>
    </div>
  );
};

export default ReportDetail;