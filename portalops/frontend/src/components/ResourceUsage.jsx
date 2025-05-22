import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axiosInstance from '../api/axiosInstance'; // axios có gắn JWT

export default function ResourceUsage() {
  const [usage, setUsage] = useState({
    cpu: { used: 0, limit: 1 },
    ram: { used: 0, limit: 1 },
    storage: { used: 0, limit: 1 },
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axiosInstance.get('/overview/limits/');
        setUsage(res.data);
      } catch (error) {
        console.error('Failed to fetch resource limits:', error);
      }
    };

    fetchUsage();
  }, []);

  const calcPercent = (used, limit) => Math.min(100, Math.round((used / limit) * 100));

  const cpuUsage = calcPercent(usage.cpu.used, usage.cpu.limit);
  const ramUsage = calcPercent(usage.ram.used, usage.ram.limit);
  const storageUsage = calcPercent(usage.storage.used, usage.storage.limit);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Resource Usage</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* CPU */}
        <div className="bg-gray-100 h-36 flex items-center justify-center rounded-xl flex-col">
          <div className="w-20">
            <CircularProgressbar
              value={cpuUsage}
              text={`${cpuUsage}%`}
              styles={buildStyles({
                pathColor: '#3b82f6',
                textColor: '#1e3a8a',
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <p className="mt-2 font-medium">CPU</p>
        </div>

        {/* RAM */}
        <div className="bg-gray-100 h-36 flex items-center justify-center rounded-xl flex-col">
          <div className="w-20">
            <CircularProgressbar
              value={ramUsage}
              text={`${ramUsage}%`}
              styles={buildStyles({
                pathColor: '#10b981',
                textColor: '#064e3b',
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <p className="mt-2 font-medium">RAM</p>
        </div>

        {/* Storage */}
        <div className="col-span-2 bg-gray-100 h-36 flex items-center justify-center rounded-xl flex-col">
          <div className="w-24">
            <CircularProgressbar
              value={storageUsage}
              text={`${storageUsage}%`}
              styles={buildStyles({
                pathColor: '#f59e0b',
                textColor: '#78350f',
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <p className="mt-2 font-medium">Storage</p>
        </div>
      </div>
    </div>
  );
}
