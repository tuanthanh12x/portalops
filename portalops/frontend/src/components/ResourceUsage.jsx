import React from 'react';
import { formatPercentage, formatRAM, formatStorage } from '../utils/formatUtils';
import './ResourceUsage.css';

const ResourceUsage = ({ limits }) => {
  const renderGauge = (value, max, color) => {
    const percentage = formatPercentage(value, max);
    const strokeDashoffset = 283 - (283 * percentage) / 100;

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
          <circle
            className="path"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            stroke={color}
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-fantasy holographic-text">
            {percentage}%
          </span>
        </div>
        <div className="absolute inset-0 quantum-glow" />
      </div>
    );
  };

  const renderCard = (title, used, limit, color, formatter, unit) => (
    <div className="relative bg-gradient-to-br  rounded-xl shadow-2xl p-6 overflow-hidden futuristic-card">
      <div className="absolute inset-0 neon-glow" />
      <div className="absolute inset-0 particle-bg">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
      </div>
      <h4 className="text-lg font-bold text-white mb-3 font-fantasy">{title}</h4>
      <div className="flex items-center justify-center">
        {renderGauge(used, limit, color)}
      </div>
      <div className="flex justify-between text-sm text-gray-300 mt-4 font-fantasy">
        <span className="data-stream">
          {formatter(used)} / {formatter(limit)}{unit ? ` ${unit}` : ''}
        </span>
        <span className="data-stream">
          {formatter(limit - used)} Free
        </span>
      </div>
    </div>
  );

  return (
    <div className="col-span-5">
      <h2 className="text-3xl font-bold text-white mb-6 font-fantasy holographic-text">
        Resource Usage
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderCard('Memory', limits.ram.used, limits.ram.limit, '#9333EA', formatRAM)}
        {renderCard('CPU', limits.cpu.used, limits.cpu.limit, '#00FFFF', val => val, 'Core')}
        {renderCard('Storage', limits.storage.used, limits.storage.limit, '#FF00FF', formatStorage)}
      </div>
    </div>
  );
};

export default ResourceUsage;
