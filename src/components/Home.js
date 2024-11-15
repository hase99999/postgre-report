import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <ul>
          <li>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <Link to="/doctors">Doctors</Link>
          </li>
          <li>
            <Link to="/ptinfos">Patient Information</Link>
          </li>
          <li>
            <Link to="/import">Import Patient Information</Link>
          </li>
          <li>
            <Link to="/import/report">Import Report Information</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;