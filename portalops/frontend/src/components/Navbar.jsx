import React, { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [computeDropdownOpen, setComputeDropdownOpen] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);

  const computeRef = useRef(null);
  const storageRef = useRef(null);

  // Đóng menu khi click ngoài (mobile + desktop dropdowns)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !e.target.closest('#mobile-menu') &&
        !e.target.closest('#hamburger-btn') &&
        !computeRef.current?.contains(e.target) &&
        !storageRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
        setComputeDropdownOpen(false);
        setStorageDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Toggle dropdown desktop
  const toggleCompute = () => {
    setComputeDropdownOpen((prev) => {
      if (!prev) setStorageDropdownOpen(false);
      return !prev;
    });
  };
  const toggleStorage = () => {
    setStorageDropdownOpen((prev) => {
      if (!prev) setComputeDropdownOpen(false);
      return !prev;
    });
  };

  // Toggle dropdown mobile (giữ nguyên)
  const toggleComputeMobile = () => {
    setComputeDropdownOpen((prev) => {
      if (!prev) setStorageDropdownOpen(false);
      return !prev;
    });
  };
  const toggleStorageMobile = () => {
    setStorageDropdownOpen((prev) => {
      if (!prev) setComputeDropdownOpen(false);
      return !prev;
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <a href="/" className="text-2xl font-bold tracking-wide">
          GreenCloud
        </a>

        {/* Hamburger button (mobile) */}
        <button
          id="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex md:items-center md:space-x-8 text-lg">
          <li>
            <a
              href="/"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Dashboard
            </a>
          </li>

          {/* Compute dropdown desktop */}
          <li className="relative" ref={computeRef}>
            <button
              onClick={toggleCompute}
              className="flex items-center hover:text-gray-300 transition-colors duration-200 focus:outline-none"
              aria-expanded={computeDropdownOpen}
              aria-haspopup="true"
            >
              Compute
              <svg
                className={`ml-1 h-4 w-4 transform transition-transform ${
                  computeDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {computeDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-20">
                <li>
                  <a
                    href="/instances"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Instances
                  </a>
                </li>
                <li>
                  <a
                    href="/images"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Images
                  </a>
                </li>
                <li>
                  <a
                    href="/keypairs"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Keypairs
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Storage dropdown desktop */}
          <li className="relative" ref={storageRef}>
            <button
              onClick={toggleStorage}
              className="flex items-center hover:text-gray-300 transition-colors duration-200 focus:outline-none"
              aria-expanded={storageDropdownOpen}
              aria-haspopup="true"
            >
              Storage
              <svg
                className={`ml-1 h-4 w-4 transform transition-transform ${
                  storageDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {storageDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-20">
                <li>
                  <a
                    href="/volumes"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Volumes
                  </a>
                </li>
                <li>
                  <a
                    href="/create-image"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Snapshots
                  </a>
                </li>
                <li>
                  <a
                    href="/create-keypair"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Buckets
                  </a>
                </li>
              </ul>
            )}
          </li>

          <li>
            <a
              href="/"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Network
            </a>
          </li>
          <li>
            <a
              href="/"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Billing
            </a>
          </li>
          <li>
            <a
              href="/"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Support
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <nav className="flex flex-col mt-16 space-y-4 px-6">
          <a
            href="/"
            className="text-white text-xl py-2 border-b border-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </a>

          <div>
            <button
              onClick={toggleComputeMobile}
              className="w-full flex justify-between items-center text-white text-lg py-2 border-b border-gray-700 focus:outline-none"
            >
              Compute
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  computeDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {computeDropdownOpen && (
              <ul className="pl-4 mt-2 space-y-2">
                <li>
                  <a
                    href="/instances"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Instances
                  </a>
                </li>
                <li>
                  <a
                    href="/images"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Images
                  </a>
                </li>
                <li>
                  <a
                    href="/keypairs"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Keypairs
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div>
            <button
              onClick={toggleStorageMobile}
              className="w-full flex justify-between items-center text-white text-lg py-2 border-b border-gray-700 focus:outline-none"
            >
              Storage
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  storageDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {storageDropdownOpen && (
              <ul className="pl-4 mt-2 space-y-2">
                <li>
                  <a
                    href="/create-volume"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Volume
                  </a>
                </li>
                <li>
                  <a
                    href="/create-image"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Snapshots
                  </a>
                </li>
                <li>
                  <a
                    href="/create-keypair"
                    className="block text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Buckets
                  </a>
                </li>
              </ul>
            )}
          </div>

          <a
            href="/"
            className="text-white text-lg py-2 border-b border-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Network
          </a>
          <a
            href="/"
            className="text-white text-lg py-2 border-b border-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Billing
          </a>
          <a
            href="/"
            className="text-white text-lg py-2 border-b border-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Support
          </a>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
