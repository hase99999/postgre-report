import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/reports">Go to Reports</Link>
      <br />
      <Link to="/doctors">Go to Doctors</Link>
      <br />
      <Link to="/ptinfos">Go to Patient Information</Link>
    </div>
  );
}

export default Home;