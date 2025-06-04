import React, { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [computeDropdownOpen, setComputeDropdownOpen] = useState(false);
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);

  const computeRef = useRef(null);
  const storageRef = useRef(null);

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
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (dropdown) => {
    if (dropdown === 'compute') {
      setComputeDropdownOpen((prev) => {
        if (!prev) setStorageDropdownOpen(false);
        return !prev;
      });
    } else if (dropdown === 'storage') {
      setStorageDropdownOpen((prev) => {
        if (!prev) setComputeDropdownOpen(false);
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

        {/* Hamburger Button (Mobile) */}
        <button
          id="hamburger-btn"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
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

        {/* Desktop Menu */}
        <ul className="hidden md:flex md:items-center md:space-x-10 text-lg">
          <li>
            <a
              href="/"
              className="hover:text-emerald-400 transition-colors duration-300 font-medium"
            >
              Dashboard
            </a>
          </li>

          {/* Compute Dropdown */}
          <li className="relative" ref={computeRef}>
            <button
              onClick={() => toggleDropdown('compute')}
              className="flex items-center space-x-1 hover:text-emerald-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
              aria-haspopup="true"
              aria-expanded={computeDropdownOpen}
            >
              <span>Compute</span>
              <svg
                className={`h-4 w-4 transform transition-transform duration-300 ${
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
              <ul
                className="absolute left-0 mt-3 w-44 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-30"
                role="menu"
                aria-label="Compute submenu"
              >
                <li>
                  <a
                    href="/instances"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Instances
                  </a>
                </li>
                <li>
                  <a
                    href="/images"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Images
                  </a>
                </li>
                <li>
                  <a
                    href="/keypairs"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Keypairs
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Storage Dropdown */}
          <li className="relative" ref={storageRef}>
            <button
              onClick={() => toggleDropdown('storage')}
              className="flex items-center space-x-1 hover:text-emerald-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
              aria-haspopup="true"
              aria-expanded={storageDropdownOpen}
            >
              <span>Storage</span>
              <svg
                className={`h-4 w-4 transform transition-transform duration-300 ${
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
              <ul
                className="absolute left-0 mt-3 w-44 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-30"
                role="menu"
                aria-label="Storage submenu"
              >
                <li>
                  <a
                    href="/volumes"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Volumes
                  </a>
                </li>
                <li>
                  <a
                    href="/snapshots"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Snapshots
                  </a>
                </li>
                <li>
                  <a
                    href="/buckets"
                    className="block px-5 py-3 hover:bg-gray-700 transition-colors"
                    role="menuitem"
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
              className="hover:text-emerald-400 transition-colors duration-300 font-medium"
            >
              Network
            </a>
          </li>
          <li>
            <a
              href="/"
              className="hover:text-emerald-400 transition-colors duration-300 font-medium"
            >
              Billing
            </a>
          </li>
          <li>
            <a
              href="/"
              className="hover:text-emerald-400 transition-colors duration-300 font-medium"
            >
              Support
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col mt-20 px-6 space-y-6 text-lg select-none">
          <a
            href="/"
            className="text-gray-100 font-semibold border-b border-gray-700 py-3 hover:text-emerald-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </a>

          <div>
            <button
              onClick={() => toggleDropdown('compute')}
              className="w-full flex justify-between items-center text-gray-100 font-semibold py-3 border-b border-gray-700 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
              aria-expanded={computeDropdownOpen}
              aria-controls="mobile-compute-menu"
              aria-haspopup="true"
            >
              <span>Compute</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
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
              <ul
                id="mobile-compute-menu"
                className="pl-6 mt-2 space-y-2"
                role="menu"
                aria-label="Mobile Compute submenu"
              >
                <li>
                  <a
                    href="/instances"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Instances
                  </a>
                </li>
                <li>
                  <a
                    href="/images"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Images
                  </a>
                </li>
                <li>
                  <a
                    href="/keypairs"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Keypairs
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleDropdown('storage')}
              className="w-full flex justify-between items-center text-gray-100 font-semibold py-3 border-b border-gray-700 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
              aria-expanded={storageDropdownOpen}
              aria-controls="mobile-storage-menu"
              aria-haspopup="true"
            >
              <span>Storage</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
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
              <ul
                id="mobile-storage-menu"
                className="pl-6 mt-2 space-y-2"
                role="menu"
                aria-label="Mobile Storage submenu"
              >
                <li>
                  <a
                    href="/volumes"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Volumes
                  </a>
                </li>
                <li>
                  <a
                    href="/snapshots"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Snapshots
                  </a>
                </li>
                <li>
                  <a
                    href="/buckets"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Buckets
                  </a>
                </li>
              </ul>
            )}
          </div>

          <a
            href="/"
            className="text-gray-100 font-semibold border-b border-gray-700 py-3 hover:text-emerald-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Network
          </a>
          <a
            href="/"
            className="text-gray-100 font-semibold border-b border-gray-700 py-3 hover:text-emerald-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Billing
          </a>
          <a
            href="/"
            className="text-gray-100 font-semibold border-b border-gray-700 py-3 hover:text-emerald-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Support
          </a>
        </nav>
      </div>

      {/* Overlay for mobile menu */}
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
