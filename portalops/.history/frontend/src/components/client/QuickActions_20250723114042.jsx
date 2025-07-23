import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickActions = () => {
  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)', // Màu indigo glow
      transition: { duration: 0.25 },
    },
    tap: {
      scale: 0.97,
      transition: { duration: 0.15 },
    },
  };

  const commonButtonClass =
    'relative bg-black/30 backdrop-blur-lg border border-gray-700 text-gray-200 py-3 px-6 rounded-lg shadow-md overflow-hidden group transition';

  return (
    <div className="quick-actions col-span-2 flex flex-col">
      <h2 className="text-2xl font-bold text-indigo-400 mb-4 font-fantasy ml-1 mt-5 drop-shadow-md">
        Quick Actions
      </h2>
      <div className="flex flex-col gap-4 mt-5">
        {/* Create Instance */}
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={commonButtonClass}
        >
          <Link
            to="/create-instance"
            className="relative z-10 inline-block text-center w-full font-semibold"
          >
            Create Instance
          </Link>
          <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </motion.div>

        {/* Add Volume */}
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={commonButtonClass}
        >
          <Link
            to="/manage-project"
            className="relative z-10 inline-block text-center w-full font-semibold"
          >
            Manage Package
          </Link>
          <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </motion.div>

        {/* View Billing */}
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={commonButtonClass}
        >
          <span className="relative z-10 inline-block text-center w-full font-semibold">
            View Billing
          </span>
          <div className="absolute inset-0 bg-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </motion.div>
      </div>
    </div>
  );
};

export default QuickActions;
