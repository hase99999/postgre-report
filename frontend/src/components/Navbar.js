import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav>
    <ul>
      {/* 他のリンクがあれば追加 */}
      <li>
        <Link to="/import-teaching-files">TeachingFileインポート</Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;