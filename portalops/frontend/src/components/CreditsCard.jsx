import React from 'react';
import { motion } from 'framer-motion';
import './CreditsCard.css';

const CreditsCard = () => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    hover: {
      scale: 1.03,
      boxShadow: '0 0 30px rgba(0, 255, 255, 0.7), 0 0 50px rgba(0, 255, 255, 0.4)',
      transition: { duration: 0.3 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }),
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-gray-900 to-cyan-900 rounded-xl shadow-2xl p-6 overflow-hidden futuristic-card"
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
        <h4 className="text-xl font-bold text-white font-fantasy">My Credits</h4>
        <motion.button
          className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full shadow-neon hover:bg-opacity-80"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Top up
        </motion.button>
      </div>
      <p className="text-sm text-gray-300 mb-4 holographic-text">
        💰 <strong>Remaining:</strong>{' '}
        <span className="text-cyan-400 data-stream">55 Credits</span>
      </p>
      <div className="w-full text-sm text-gray-300">
        <div className="grid grid-cols-4 gap-2 font-fantasy text-xs mb-2">
          <div className="text-left">Period</div>
          <div className="text-right">Used</div>
          <div className="text-right">Remaining</div>
          <div className="text-right">Total</div>
        </div>
        <motion.div
          className="grid grid-cols-4 gap-2 text-xs border-b border-cyan-900/50 py-2"
          variants={rowVariants}
          custom={0}
        >
          <div>Week</div>
          <div className="text-right text-yellow-400 data-stream">12</div>
          <div className="text-right text-cyan-400 data-stream">88</div>
          <div className="text-right text-blue-400 data-stream">100</div>
        </motion.div>
        <motion.div
          className="grid grid-cols-4 gap-2 text-xs py-2"
          variants={rowVariants}
          custom={1}
        >
          <div>Month</div>
          <div className="text-right text-yellow-400 data-stream">45</div>
          <div className="text-right text-cyan-400 data-stream">55</div>
          <div className="text-right text-blue-400 data-stream">100</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreditsCard;