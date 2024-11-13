import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <nav>
        <ul>
          <li>
            <Link to="/reports">Go to Reports</Link>
          </li>
          <li>
            <Link to="/doctors">Go to Doctors</Link>
          </li>
          <li>
            <Link to="/ptinfos">Go to Patient Information</Link>
          </li>
          <li>
            <Link to="/import">Go to Import Patient Information</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;