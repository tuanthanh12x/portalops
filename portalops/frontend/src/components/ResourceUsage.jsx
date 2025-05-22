import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ResourceUsage() {
  const cpuUsage = 68;
  const ramUsage = 52;
  const storageUsage = 75;

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

        {/* Storage (chiếm hết 2 cột) */}
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
