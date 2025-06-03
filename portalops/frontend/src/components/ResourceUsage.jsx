import React, { useEffect, useState, useRef } from 'react';
import { formatRAM, formatStorage } from '../utils/formatUtils';
import './ResourceUsage.css';

function useAnimatedProgress(targetPercent, duration = 1500) {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    function animate(timestamp) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progressValue = Math.min((elapsed / duration) * targetPercent, targetPercent);
      setProgress(progressValue);
      if (elapsed < duration) {
        requestRef.current = requestAnimationFrame(animate);
      }
    }
    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [targetPercent, duration]);

  return progress;
}

const AnimatedGauge = ({ value, max, title }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const animatedPercent = useAnimatedProgress(percentage);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * animatedPercent) / 100;

  const primaryColor = '#4F46E5'; // Indigo 600 from Tailwind palette

  return (
    <div
      role="img"
      aria-label={`${title} usage: ${animatedPercent.toFixed(1)} percent`}
      tabIndex={0}
      className="relative w-36 h-36 mx-auto cursor-help"
      aria-describedby={`${title}-tooltip`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#374151" // Gray 700
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={primaryColor}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="text-4xl font-semibold text-white">
          {animatedPercent.toFixed(1)}%
        </span>
        <span className="mt-1 text-sm text-gray-300 font-mono">{title}</span>
      </div>

      <div
        id={`${title}-tooltip`}
        role="tooltip"
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-3 rounded-lg bg-gray-900 bg-opacity-90 text-white text-xs shadow-lg opacity-0 transition-opacity duration-300 pointer-events-none"
      >
        <p>
          {title} usage is <strong>{animatedPercent.toFixed(1)}%</strong>.<br />
          {value} used of {max} total.
        </p>
      </div>
    </div>
  );
};

const ResourceUsage = ({ limits = {} }) => {
  return (
    <section aria-labelledby="resource-usage-heading" className="col-span-5 px-4 sm:px-0">
      <h2
        id="resource-usage-heading"
        className="text-4xl font-bold text-white mb-8"
      >
        Resource Usage
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatedGauge
          title="Memory"
          value={limits.ram?.used ?? 0}
          max={limits.ram?.limit ?? 1}
        />
        <AnimatedGauge
          title="CPU"
          value={limits.cpu?.used ?? 0}
          max={limits.cpu?.limit ?? 1}
        />
        <AnimatedGauge
          title="Storage"
          value={limits.storage?.used ?? 0}
          max={limits.storage?.limit ?? 1}
        />
      </div>
    </section>
  );
};

export default ResourceUsage;
