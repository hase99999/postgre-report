import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ docname: '', department: '', hostital: '' });

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/api/doctors');
      console.log('API response:', response.data);
      if (Array.isArray(response.data)) {
        setDoctors(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    console.log('Fetching doctors...');
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosInstance.post('/api/doctors', form);
    fetchDoctors();
  };

  const handleDelete = async (id) => {
    await axiosInstance.delete(`/api/doctors/${id}`);
    fetchDoctors();
  };

  return (
    <div>
      <h2>Doctors</h2>
      <form onSubmit={handleSubmit}>
        <input name="docname" value={form.docname} onChange={handleChange} placeholder="Name" />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Specialty" />
        <input name="hostital" value={form.hostital} onChange={handleChange} placeholder="Contact" />
        <button type="submit">Add Doctor</button>
      </form>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor.docid}>
            {doctor.docname} - {doctor.department} - {doctor.hostital}
            <button onClick={() => handleDelete(doctor.docid)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Doctor;