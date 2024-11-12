import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PtinfoList = () => {
  const [ptinfos, setPtinfos] = useState([]);
  const [error, setError] = useState(null);

  const fetchPtinfos = async () => {
    try {
      const response = await axios.get('/api/ptinfos');
      console.log('API response:', response.data);
      if (Array.isArray(response.data)) {
        setPtinfos(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
        setError('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching patient information:', error);
      setError('Error fetching patient information');
    }
  };

  useEffect(() => {
    console.log('Fetching patient information...');
    fetchPtinfos();
  }, []);

  return (
    <div>
      <h2>Patient Information</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {ptinfos.map((ptinfo) => (
          <li key={ptinfo.id}>
            {ptinfo.name} - {ptinfo.age} - {ptinfo.condition}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PtinfoList;