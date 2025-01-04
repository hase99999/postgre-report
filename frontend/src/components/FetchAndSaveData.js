// src/components/FetchAndSaveData.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const FetchAndSaveData = () => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('これからFetched dataします');
        const response = await axiosInstance.get('/api/fetch-4d-data');
        console.log('Fetched data:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data from 4D:', error);
        setError('データの取得に失敗しました。');
      }
    };

    fetchData();
  }, []);

  const handleSelect = (item) => {
    setSelectedData((prevSelected) => {
      if (prevSelected.includes(item)) {
        return prevSelected.filter((i) => i !== item);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const handleSave = async () => {
    try {
      await axiosInstance.post('/api/save-data', { selectedData });
      // 保存成功時の処理
    } catch (error) {
      console.error('Error saving data:', error);
      setError('データの保存に失敗しました。');
    }
  };

  return (
    <div>
      <h1>Fetch and Save Data</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.docid}>
              <input
                type="checkbox"
                checked={selectedData.includes(item)}
                onChange={() => handleSelect(item)}
              />
              {item.docname}
            </li>
          ))}
        </ul>
      ) : (
        <p>データをロード中...</p>
      )}
      <button onClick={handleSave}>データを保存</button>
    </div>
  );
};

export default FetchAndSaveData;