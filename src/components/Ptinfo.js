import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Ptinfo = () => {
  const [ptinfos, setPtinfos] = useState([]);
  const [form, setForm] = useState({ ptname: '', ptage: '', condition: '' });
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/ptinfos', form);
      fetchPtinfos();
      setForm({ ptname: '', ptage: '', condition: '' });
    } catch (error) {
      console.error('Error adding patient information:', error);
      setError('Error adding patient information');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/ptinfos/${id}`);
      fetchPtinfos();
    } catch (error) {
      console.error('Error deleting patient information:', error);
      setError('Error deleting patient information');
    }
  };

  return (
    <div>
      <h2>Patient Information</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="ptname" value={form.ptname} onChange={handleChange} placeholder="Name" />
        <input name="ptage" value={form.ptage} onChange={handleChange} placeholder="Age" />
        <input name="condition" value={form.condition} onChange={handleChange} placeholder="Condition" />
        <button type="submit">Add Patient Information</button>
      </form>
      <ul>
        {ptinfos.map((ptinfo) => (
          <li key={ptinfo.id}>
            {ptinfo.ptname} - {ptinfo.ptage} - {ptinfo.condition}
            <button onClick={() => handleDelete(ptinfo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ptinfo;