import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Ptinfo = () => {
  const [ptinfos, setPtinfos] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 100; // 1ページあたりの表示件数

  useEffect(() => {
    const fetchPtinfos = async () => {
      try {
        const response = await axios.get('/api/ptinfos', {
          params: { page, limit },
        });
        setPtinfos(response.data.ptinfos);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching patient information:', error);
      }
    };

    fetchPtinfos();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2>Patient Information</h2>
      <table>
        <thead>
          <tr>
            <th>Pt Number</th>
            <th>Pt Name</th>
            <th>Pt Age</th>
            <th>Birth</th>
            <th>Sex</th>
          </tr>
        </thead>
        <tbody>
          {ptinfos.map((ptinfo) => (
            <tr key={ptinfo.id}>
              <td>{ptinfo.ptnumber}</td>
              <td>{ptinfo.ptname}</td>
              <td>{ptinfo.ptage}</td>
              <td>{ptinfo.bith}</td>
              <td>{ptinfo.sex}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Ptinfo;