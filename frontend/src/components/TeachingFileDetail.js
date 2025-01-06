import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const TeachingFileDetail = () => {
  const { id } = useParams();
  const [teachingFile, setTeachingFile] = useState(null);

  useEffect(() => {
    const fetchTeachingFile = async () => {
      try {
        const response = await axios.get(`/api/teachingFiles/${id}`);
        setTeachingFile(response.data);
      } catch (error) {
        console.error('TeachingFileの取得中にエラーが発生しました:', error);
      }
    };

    fetchTeachingFile();
  }, [id]);

  if (!teachingFile) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>TeachingFile 詳細</h1>
      <ul>
        <li><strong>ID:</strong> {teachingFile.id}</li>
        <li><strong>PT Number:</strong> {teachingFile.ptnumber}</li>
        <li><strong>Site:</strong> {teachingFile.site}</li>
        <li><strong>Field:</strong> {teachingFile.field}</li>
        <li><strong>Age/Sex:</strong> {teachingFile.agesex}</li>
        <li><strong>History:</strong> {teachingFile.pthistory}</li>
        <li><strong>Answer:</strong> {teachingFile.answer}</li>
        <li><strong>Explanation:</strong> {teachingFile.explanation}</li>
        <li><strong>Registration Date:</strong> {new Date(teachingFile.registration).toLocaleDateString()}</li>
        <li><strong>Registered By:</strong> {teachingFile.registname}</li>
        <li><strong>Difficulty Level:</strong> {teachingFile.difficultylevel}</li>
        <li><strong>Pathology:</strong> {teachingFile.pathology}</li>
        <li><strong>Publication:</strong> {teachingFile.publication ? 'Yes' : 'No'}</li>
      </ul>
      <Link to="/teachingFiles">一覧に戻る</Link>
    </div>
  );
};

export default TeachingFileDetail;