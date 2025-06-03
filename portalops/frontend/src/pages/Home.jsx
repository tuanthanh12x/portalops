import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AccountCard from '../components/AccountCard';
import NotificationsCard from '../components/NotificationsCard';
import CreditsCard from '../components/CreditsCard';
import ResourceUsage from '../components/ResourceUsage';
import QuickActions from '../components/QuickActions';
import InstancesTable from '../components/InstancesTable';
import './Home.css';
import axiosInstance from '../api/axiosInstance';
import getUserInfoFromToken from '../utils/getUserInfoFromToken';
import { useLogout } from '../features/auth/Logout';

export default function Home() {
  const logout = useLogout();
  const [userInfo, setUserInfo] = useState(null);
  const [instances, setInstances] = useState([]);
  const [limits, setLimits] = useState({
    cpu: { used: 0, limit: 1 },
    ram: { used: 0, limit: 1 },
    storage: { used: 0, limit: 1 },
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const user = getUserInfoFromToken(token);
      setUserInfo(user);
    }
  }, []);

  useEffect(() => {
  let retryCount = 0;
  const maxRetries = 3;

  const fetchInstances = async () => {
    try {
      const res = await axiosInstance.get('/overview/instances/');
      if (res.data && res.data.length > 0) {
        setInstances(res.data);
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Empty data, retrying ${retryCount}/${maxRetries}...`);
        setTimeout(fetchInstances, 2000); // retry after 2 seconds
      } else {
        console.warn("Max retries reached, no data available.");
        setInstances([]); // set empty to avoid loading forever
      }
    } catch (error) {
      console.error("Failed to fetch instances", error);
    }
  };

  fetchInstances();
}, []);


  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await axiosInstance.get('/overview/limits/');
        setLimits(res.data);
      } catch (error) {
        console.error("Failed to fetch resource limits", error);
      }
    };
    fetchLimits();
  }, []);

  return (
    <div className="dark">
      <div className="fixed top-4 right-4 z-[100] space-y-2" id="toast-container" data-turbo-permanent="" />
      <Navbar credits={150} />
      <div className="container mx-auto px-4 mt-10 md:mt-10">
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-300">
                Greetings, <span className="text-gray-400">{userInfo?.username || 'User'}</span>
              </h1>

            </div>
            <div className="flex justify-end items-center gap-1 md:gap-3">
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 group transition-all duration-200 ease-in-out cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-gray-300 group-hover:text-white transition" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"></path>
                </svg>
                <span className="hidden md:block text-gray-300 group-hover:text-white transition">Account</span>
              </div>

              <div className="flex items-center space-x-2 p-2 rounded-md cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-gray-200" viewBox="0 0 16 16">
                  <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2zm1 13h8V2H4v13z"></path>
                  <path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"></path>
                </svg>
                <button
                  className="hidden md:inline-block whitespace-nowrap px-4 py-2 text-sm text-white bg-gray-800 rounded-md 
  hover:bg-red-600 hover:text-white transition-all duration-200 ease-in-out shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  Logout
                </button>

              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-4">
          <AccountCard />
          <NotificationsCard />
          <CreditsCard />
        </div>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-7">
          <div className="col-span-7 md:col-span-4">
            <ResourceUsage limits={limits} />
          </div>
          <div className="col-span-7 md:col-span-3">
            <QuickActions />
          </div>
        </div>
        <InstancesTable instances={instances} />
      </div>
    </div>
  );
}