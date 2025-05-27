import React from 'react';
import { motion } from 'framer-motion';
import './AccountCard.css';

const AccountCard = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: {
      scale: 1.03,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="absolute inset-0 neon-glow" />
      <h4 className="text-xl font-bold text-white mb-4 font-fantasy">Account</h4>
      <div className="space-y-3">
        <motion.div
          className="flex justify-between items-center text-gray-300 group"
          variants={itemVariants}
          custom={0}
        >
          <span className="font-semibold">Email</span>
          <span className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
            tuanthanhxp1901@gmail.com
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center text-gray-300 group"
          variants={itemVariants}
          custom={1}
        >
          <span className="font-semibold">2FA</span>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full group-hover:bg-gray-600 transition-colors duration-300">
            Off
          </span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center text-gray-300 group"
          variants={itemVariants}
          custom={2}
        >
          <span className="font-semibold">Last Login</span>
          <span className="text-xs">May 23, 2025 9:54 AM</span>
        </motion.div>
        <motion.div
          className="flex justify-between items-center text-gray-300 group"
          variants={itemVariants}
          custom={3}
        >
          <span className="font-semibold">Timezone</span>
          <span className="text-xs">Asia/Bangkok</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AccountCard;