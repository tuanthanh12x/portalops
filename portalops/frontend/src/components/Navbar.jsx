import React, { useState } from 'react';
import { useLogout } from '../features/auth/Logout';
import './Navbar.css';

const Navbar = () => {
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="primary-navigation">
      <div className="nav-header">
        <img
          src="https://greencloudvps.com/img/site/logo.png"
          alt="Logo"
          style={{ height: '20px' }}
        />
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <ul className={menuOpen ? 'nav-menu open' : 'nav-menu'}>
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
        <li><a href="/profile">User Profile</a></li>
        <li><a href="/notifications">Notification</a></li>
        <li><a href="#">Credits: <strong>$120</strong></a></li>
        <li>
          <button className="logout-button" onClick={logout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
