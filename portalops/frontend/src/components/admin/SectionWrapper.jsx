import React from 'react';

const SectionWrapper = ({ children }) => (
  <div className="p-4 bg-black/30 backdrop-blur-lg rounded-xl shadow-xl border border-gray-700">
    {children}
  </div>
);

export default SectionWrapper;