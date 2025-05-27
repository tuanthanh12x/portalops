import React from 'react';
import { motion } from 'framer-motion';
import { formatPercentage, formatRAM, formatStorage } from '../utils/formatUtils';
import './ResourceUsage.css';

const ResourceUsage = ({ limits }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 40px rgba(147, 51, 234, 0.8), 0 0 60px rgba(147, 51, 234, 0.5)',
      transition: { duration: 0.3 },
    },
  };

  const gaugeVariants = {
    hidden: { rotate: -90, opacity: 0 },
    visible: { rotate: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.5, duration: 0.5 } },
  };

  const renderGauge = (value, max, color) => {
    const percentage = formatPercentage(value, max);
    return (
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="trail"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
          />
          <motion.circle
            className="path"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            stroke={color}
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * percentage) / 100}
            variants={gaugeVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-fantasy holographic-text"
            variants={textVariants}
          >
            {percentage}%
          </motion.span>
        </div>
        <div className="absolute inset-0 quantum-glow" />
      </div>
    );
  };

  return (
    <div className="col-span-5">
      <h2 className="text-3xl font-bold text-white mb-6 font-fantasy holographic-text">
        Resource Usage
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memory Card */}
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
          </div>
          <h4 className="text-lg font-bold text-white mb-3 font-fantasy">Memory</h4>
          <div className="flex items-center justify-center">
            {renderGauge(limits.ram.used, limits.ram.limit, '#9333EA')}
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-4 font-fantasy">
            <span className="data-stream">
              {formatRAM(limits.ram.used)} / {formatRAM(limits.ram.limit)}
            </span>
            <span className="data-stream">
              {formatRAM(limits.ram.limit - limits.ram.used)} Free
            </span>
          </div>
        </motion.div>

        {/* CPU Card */}
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
          </div>
          <h4 className="text-lg font-bold text-white mb-3 font-fantasy">CPU</h4>
          <div className="flex items-center justify-center">
            {renderGauge(limits.cpu.used, limits.cpu.limit, '#00FFFF')}
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-4 font-fantasy">
            <span className="data-stream">
              {limits.cpu.used} / {limits.cpu.limit} Core
              {limits.cpu.limit !== 1 ? 's' : ''}
            </span>
            <span className="data-stream">
              {limits.cpu.limit - limits.cpu.used} Free
            </span>
          </div>
        </motion.div>

        {/* Storage Card */}
        <motion.div
          className="relative bg-gradient-to-br from-gray-900 to-pink-900 rounded-xl shadow-2xl p-6 overflow-hidden futuristic-card"
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
          </div>
          <h4 className="text-lg font-bold text-white mb-3 font-fantasy">Storage</h4>
          <div className="flex items-center justify-center">
            {renderGauge(limits.storage.used, limits.storage.limit, '#FF00FF')}
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-4 font-fantasy">
            <span className="data-stream">
              {formatStorage(limits.storage.used)} / {formatStorage(limits.storage.limit)}
            </span>
            <span className="data-stream">
              {formatStorage(limits.storage.limit - limits.storage.used)} Free
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourceUsage;