import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/api/doctors');
        console.log('API response:', response.data); // 追加
        if (Array.isArray(response.data)) {
          setDoctors(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      <h1>Doctors</h1>
      {doctors.length > 0 ? (
        <ul>
          {doctors.map(doctor => (
            <li key={doctor.id}>
              <p>Name: {doctor.name}</p>
              <p>Specialty: {doctor.specialty}</p>
              <p>Contact: {doctor.contact}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default DoctorList;