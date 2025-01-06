import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeachingFileList = () => {
  const [teachingFiles, setTeachingFiles] = useState([]);

  useEffect(() => {
    const fetchTeachingFiles = async () => {
      try {
        const response = await axios.get('/api/teachingFiles');
        setTeachingFiles(response.data);
      } catch (error) {
        console.error('TeachingFilesの取得中にエラーが発生しました:', error);
      }
    };

    fetchTeachingFiles();
  }, []);

  return (
    <div>
      <h1>TeachingFile 一覧</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>PT Number</th>
            <th>Site</th>
            <th>Field</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {teachingFiles.map(file => (
            <tr key={file.id}>
              <td>{file.id}</td>
              <td>{file.ptnumber}</td>
              <td>{file.site}</td>
              <td>{file.field}</td>
              <td>
                <Link to={`/teachingFiles/${file.id}`}>詳細</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeachingFileList;