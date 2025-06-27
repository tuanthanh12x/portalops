import React, { useEffect, useState, useRef } from 'react';
import { formatRAM, formatStorage } from '../../utils/formatUtils';

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

const AnimatedGauge = ({ value, max, title, unit }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const animatedPercent = useAnimatedProgress(percentage);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * animatedPercent) / 100;

  const primaryColor = '#6366f1'; // Tailwind Indigo-500

  return (
    <div
      className="relative w-40 h-40 bg-black/30 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center transition transform hover:scale-105 hover:shadow-2xl"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0">
        <circle cx="50" cy="50" r="45" stroke="#1F2937" strokeWidth="10" fill="none" />
        <circle
          cx="50" cy="50" r="45"
          stroke={primaryColor}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
        <span className="text-3xl font-bold">{animatedPercent.toFixed(1)}%</span>
        <span className="text-sm text-indigo-200 mt-1">{title}</span>
      </div>

      <div className="absolute bottom-2 text-xs text-gray-300 text-center">
        {unit}
      </div>
    </div>
  );
};

const ResourceUsage = ({ limits = {} }) => {
  return (
    <section className="col-span-5 px-4 sm:px-0 mt-10">
      <h2 className="text-3xl font-bold text-white mb-6">Resource Usage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatedGauge
          title="Memory"
          value={limits.ram?.used ?? 0}
          max={limits.ram?.limit ?? 1}
          unit={`${formatRAM(limits.ram?.used ?? 0)} / ${formatRAM(limits.ram?.limit ?? 1)}`}
        />
        <AnimatedGauge
          title="CPU"
          value={limits.cpu?.used ?? 0}
          max={limits.cpu?.limit ?? 1}
          unit={`${limits.cpu?.used ?? 0} / ${limits.cpu?.limit ?? 1} vCPU`}
        />
        <AnimatedGauge
          title="Storage"
          value={limits.storage?.used ?? 0}
          max={limits.storage?.limit ?? 1}
          unit={`${formatStorage(limits.storage?.used ?? 0)} / ${formatStorage(limits.storage?.limit ?? 1)}`}
        />
      </div>
    </section>
  );
};

export default ResourceUsage;
