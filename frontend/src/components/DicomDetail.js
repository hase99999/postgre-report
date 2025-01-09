import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DicomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromPage = parseInt(queryParams.get('fromPage')) || 1;

  const [dicom, setDicom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDicom();
    // eslint-disable-next-line
  }, [id]);

  const fetchDicom = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/dicom/${id}`);
      setDicom(response.data);
    } catch (error) {
      console.error('Dicom詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/dicoms?page=${fromPage}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dicom 詳細</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            一覧に戻る
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : dicom ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <table className="min-w-full">
              <tbody>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">ID</th>
                  <td className="py-2 px-4">{dicom.id}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">Ex Date</th>
                  <td className="py-2 px-4">
                    {new Date(dicom.ex_date).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">Image Num</th>
                  <td className="py-2 px-4">{dicom.image_num}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">Modality</th>
                  <td className="py-2 px-4">{dicom.modality}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">Pt ID</th>
                  <td className="py-2 px-4">{dicom.pt_ID}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left text-gray-700">Seq Num</th>
                  <td className="py-2 px-4">{dicom.seq_num}</td>
                </tr>
                <tr>
                  <th className="py-2 px-4 text-left text-gray-700">Series Path</th>
                  <td className="py-2 px-4">{dicom.seriespath}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-red-500">Dicom データが見つかりません。</div>
        )}
      </div>
    </div>
  );
};

export default DicomDetail;