import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function ResourceOverview() {
  const [resources, setResources] = useState({
    total_servers: 0,
    online_servers: 0,
    offline_servers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
       const res = await axiosInstance.get('/overview/resources/');
        setResources(res.data);
      } catch (error) {
        console.error('Failed to fetch resource overview:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-bold mb-4">Resources Overview</h2>
      <div className="space-y-2">
        <p>VPS/SERVERS: {resources.total_servers}</p>
        <p>ONLINE: {resources.online_servers}</p>
        <p>OFFLINE: {resources.offline_servers}</p>
      </div>
    </div>
  );
}
