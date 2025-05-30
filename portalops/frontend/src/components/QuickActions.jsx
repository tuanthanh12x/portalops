import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './QuickActions.css';

const QuickActions = () => {
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0 0 10px rgba(100, 149, 237, 0.6), 0 0 20px rgba(100, 149, 237, 0.4)', // softer blue glow
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="col-span-2 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-200 mb-4 font-fantasy ml-1 mt-5">Quick Actions</h2>
      <div className="flex flex-col gap-4 mt-5">
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-[#2a2a4e] to-[#1e1e3a] text-gray-200 py-3 px-6 rounded-xl shadow-md overflow-hidden group"
        >
          <Link to="/create-instance" className="relative z-10 inline-block text-center w-full font-semibold">
            Create Instance
          </Link>
          <div className="absolute inset-0 bg-[#12122a] opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.div>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-[#1e3a2a] to-[#13301e] text-gray-200 py-3 px-6 rounded-xl shadow-md overflow-hidden group"
        >
          <Link to="/create-volume" className="relative z-10 inline-block text-center w-full font-semibold">
            Add Volume
          </Link>
          <div className="absolute inset-0 bg-[#121a12] opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-[#3a3a3a] to-[#1e1e1e] text-gray-300 py-3 px-6 rounded-xl shadow-md overflow-hidden group"
        >
          <span className="relative z-10 font-semibold">View Billing</span>
          <div className="absolute inset-0 bg-[#121212] opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.button>
      </div>
    </div>
  );
};

export default QuickActions;
