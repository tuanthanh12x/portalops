import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './QuickActions.css';

const QuickActions = () => {
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.5), 0 0 25px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="col-span-2 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-fantasy">
        Quick Actions
      </h2>
      <div className="flex flex-col gap-4">
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-blue-500 to-blue-800 text-white py-3 px-6 rounded-xl shadow-lg overflow-hidden group"
        >
          <Link to="/create-instance" className="relative z-10 inline-block text-center w-full font-semibold">
            Create Instance
          </Link>
          <div className="absolute inset-0 bg-blue-900 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.div>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-green-500 to-green-800 text-white py-3 px-6 rounded-xl shadow-lg overflow-hidden group"
        >
          <span className="relative z-10 font-semibold">Add Volume</span>
          <div className="absolute inset-0 bg-green-900 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-gray-500 to-gray-800 text-white py-3 px-6 rounded-xl shadow-lg overflow-hidden group"
        >
          <span className="relative z-10 font-semibold">View Billing</span>
          <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <div className="absolute inset-0 neon-glow" />
        </motion.button>
      </div>
    </div>
  );
};

export default QuickActions;