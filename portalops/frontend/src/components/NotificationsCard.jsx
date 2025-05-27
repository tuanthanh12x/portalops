import React from 'react';
import { motion } from 'framer-motion';
import './NotificationsCard.css';

const NotificationsCard = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    hover: {
      scale: 1.03,
      boxShadow: '0 0 25px rgba(147, 51, 234, 0.7), 0 0 40px rgba(147, 51, 234, 0.4)',
      transition: { duration: 0.3 },
    },
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { delay: 0.3, duration: 0.4 } },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } },
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-gray-900 to-purple-900 rounded-xl shadow-2xl p-6 overflow-hidden futuristic-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="absolute inset-0 neon-glow" />
      <div className="absolute inset-0 particle-bg">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold text-white font-fantasy">Notifications</h4>
        <motion.span
          className="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-neon"
          variants={badgeVariants}
          animate="pulse"
        >
          0
        </motion.span>
      </div>
      <motion.div
        className="text-center text-gray-300 text-sm font-fantasy holographic-text"
        variants={textVariants}
      >
        No unread notifications
      </motion.div>
    </motion.div>
  );
};

export default NotificationsCard;