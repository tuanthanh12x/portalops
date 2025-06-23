import React, { useState } from 'react';
import { useLogout } from '../features/auth/Logout';
import './Navbar.css';

const Navbar = () => {
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [computeDropdownOpen, setComputeDropdownOpen] = useState(false); // State cho dropdown Compute
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false); // State cho dropdown Storage

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand/Logo */}
        <a className="text-xl font-semibold tracking-wide" href="/">GreenCloud</a>

        {/* Hamburger Button for Mobile */}
        <button
          className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <ul className={`absolute md:static top-full left-0 w-full md:w-auto bg-gray-900 md:bg-transparent shadow-lg md:shadow-none flex flex-col md:flex-row md:items-center md:space-x-6 lg:space-x-8 transition-all duration-300 ease-in-out ${menuOpen ? 'block py-2' : 'hidden md:flex'}`}>
          <li><a className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md" href="/">Dashboard</a></li>

          {/* Compute Dropdown */}
          <li className="relative">
            <button
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md focus:outline-none"
              onClick={() => setComputeDropdownOpen(!computeDropdownOpen)}
            >
              Compute
              <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${computeDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul className={`absolute md:absolute top-full left-0 md:left-auto md:right-0 bg-gray-800 rounded-md shadow-lg py-1 mt-2 w-48 z-10 transition-all duration-300 ease-in-out ${computeDropdownOpen ? 'block' : 'hidden'}`}>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-instance">Instances</a></li>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-image">Images</a></li>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-keypair">Key Pair</a></li>
            </ul>
          </li>

          {/* Storage Dropdown */}
          <li className="relative">
            <button
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md focus:outline-none"
              onClick={() => setStorageDropdownOpen(!storageDropdownOpen)}
            >
              Storage
              <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${storageDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul className={`absolute md:absolute top-full left-0 md:left-auto md:right-0 bg-gray-800 rounded-md shadow-lg py-1 mt-2 w-48 z-10 transition-all duration-300 ease-in-out ${storageDropdownOpen ? 'block' : 'hidden'}`}>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-volume">Volume</a></li>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-image">Snapshots</a></li>
              <li><a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" href="/create-keypair">Buckets</a></li>
            </ul>
          </li>

          <li><a className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md" href="/">Network</a></li>
          <li><a className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md" href="/">Billing</a></li>
          <li><a className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 md:hover:bg-transparent rounded-md" href="/">Support</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;