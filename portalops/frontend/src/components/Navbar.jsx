// src/components/Navbar.jsx
import React from 'react';
import { useLogout } from '../features/auth/Logout';
import './Navbar.css';

const Navbar = () => {
  const logout = useLogout();

  return (
    <nav className="primary-navigation">
      <ul>
        <li>
  <img src="https://greencloudvps.com/img/site/logo.png" alt="Logo" style={{ height: '20px' }} />
</li>
        <li><a href="/">Dashboard</a></li>
        <li>
          <a href="#">Compute ▾</a>
          <ul>
            <li><a href="/compute/instances">Instances</a></li>
            <li><a href="/compute/images">Images</a></li>
          </ul>
        </li>
        <li><a href="/storage">Storage</a></li>
        <li><a href="/network">Network</a></li>
        <li><a href="/billing">Billing</a></li>
        <li><a href="/support">Support</a></li>
        <li><a href="/support">User Profile</a></li>
        <li><a href="/support">Notification</a></li>
        <li><a href="#">Credits: <strong>$120</strong></a></li>
        <li>
          <button className="logout-button" onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
