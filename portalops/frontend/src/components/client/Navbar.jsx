import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [computeDropdownOpen, setComputeDropdownOpen] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [isImpersonated, setIsImpersonated] = useState(false);

  const computeRef = useRef(null);
  const storageRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.impersonated === true) {
          setIsImpersonated(true);
        }
      } catch (err) {
        console.error("Invalid JWT:", err);
      }
    }
  }, []);

  // const handleUnimpersonate = async () => {
  //   try {
  //     const response = await axiosInstance.post("/auth/unimpersonate/");
  //     if (response.data?.token) {
  //       const expiry = Date.now() + 60 * 60 * 1000;
  //       const tokenObj = {
  //         token: response.data.token,
  //         expiry: expiry,
  //       };
  //       localStorage.setItem("accessToken", JSON.stringify(tokenObj));
  //       window.location.href = "/admin-dashboard";
  //     } else {
  //       console.error("No new access token returned from unimpersonate.");
  //     }
  //   } catch (error) {
  //     console.error("Unimpersonate failed:", error);
  //   }
  // };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !e.target.closest('#mobile-menu') &&
        !e.target.closest('#hamburger-btn') &&
        !computeRef.current?.contains(e.target) &&
        !storageRef.current?.contains(e.target) &&
        !networkRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
        setComputeDropdownOpen(false);
        setStorageDropdownOpen(false);
        setNetworkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (dropdown) => {
    if (dropdown === 'compute') {
      setComputeDropdownOpen((prev) => {
        if (!prev) {
          setStorageDropdownOpen(false);
          setNetworkDropdownOpen(false);
        }
        return !prev;
      });
    } else if (dropdown === 'storage') {
      setStorageDropdownOpen((prev) => {
        if (!prev) {
          setComputeDropdownOpen(false);
          setNetworkDropdownOpen(false);
        }
        return !prev;
      });
    } else if (dropdown === 'network') {
      setNetworkDropdownOpen((prev) => {
        if (!prev) {
          setComputeDropdownOpen(false);
          setStorageDropdownOpen(false);
        }
        return !prev;
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-gray-100 shadow-lg font-sans">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <a
          href="/"
          className="text-3xl font-extrabold tracking-tight text-emerald-400 hover:text-emerald-300 transition-colors"
          aria-label="GreenCloud Home"
        >
          GreenCloud
        </a>

        <button
          id="hamburger-btn"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
        >
          {menuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <ul className="hidden md:flex md:items-center md:space-x-10 text-lg">
          <li><a href="/dashboard" className="hover:text-emerald-400 transition font-medium">Dashboard</a></li>

          {/* Compute Dropdown */}
          <li className="relative" ref={computeRef}>
            <button
              onClick={() => toggleDropdown('compute')}
              className="flex items-center space-x-1 hover:text-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            >
              <span>Compute</span>
              <svg className={`h-4 w-4 transform transition-transform ${computeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {computeDropdownOpen && (
              <ul className="absolute left-0 mt-3 w-44 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-30">
                <li><a href="/instances" className="block px-5 py-3 hover:bg-gray-700">Instances</a></li>
                <li><a href="/images" className="block px-5 py-3 hover:bg-gray-700">Images</a></li>
                <li><a href="/keypairs" className="block px-5 py-3 hover:bg-gray-700">Keypairs</a></li>
                <li><a href="/vps-backup" className="block px-5 py-3 hover:bg-gray-700">Backups</a></li>
              </ul>
            )}
          </li>

          {/* Storage Dropdown */}
          <li className="relative" ref={storageRef}>
            <button
              onClick={() => toggleDropdown('storage')}
              className="flex items-center space-x-1 hover:text-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            >
              <span>Storage</span>
              <svg className={`h-4 w-4 transform transition-transform ${storageDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {storageDropdownOpen && (
              <ul className="absolute left-0 mt-3 w-44 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-30">
                <li><a href="/volumes" className="block px-5 py-3 hover:bg-gray-700">Volumes</a></li>
                <li><a href="/volume-backup" className="block px-5 py-3 hover:bg-gray-700">Backups</a></li>
              </ul>
            )}
          </li>

          {/* Network Dropdown */}
          <li className="relative" ref={networkRef}>
            <button
              onClick={() => toggleDropdown('network')}
              className="flex items-center space-x-1 hover:text-emerald-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            >
              <span>Network</span>
              <svg className={`h-4 w-4 transform transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {networkDropdownOpen && (
              <ul className="absolute left-0 mt-3 w-44 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-30">
                <li><a href="/networks" className="block px-5 py-3 hover:bg-gray-700">Networks</a></li>
                <li><a href="/floating-ips" className="block px-5 py-3 hover:bg-gray-700">Floating IPs</a></li>
              </ul>
            )}
          </li>

          <li><a href="/billing" className="hover:text-emerald-400 transition font-medium">Billing</a></li>
          <li><a href="/support" className="hover:text-emerald-400 transition font-medium">Support</a></li>

          {/* {isImpersonated && (
            <li>
              <button
                onClick={handleUnimpersonate}
                className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
              >
                Return to Admin Dashboard
              </button>
            </li>
          )} */}
        </ul>
      </div>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
