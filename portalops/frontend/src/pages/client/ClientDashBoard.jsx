import React, { useEffect, useState } from 'react';
import Navbar from '../../components/client/Navbar';
import AccountCard from '../../components/client/AccountCard';
import NotificationsCard from '../../components/client/NotificationsCard';
import CreditsCard from '../../components/client/CreditsCard';
import ResourceUsage from '../../components/client/ResourceUsage';
import QuickActions from '../../components/client/QuickActions';
import InstancesTable from '../../components/client/InstancesTable';
import './ClientDashBoard.css';
import axiosInstance from '../../api/axiosInstance';
import getUserInfoFromToken from '../../utils/getUserInfoFromToken';
import { useLogout } from '../../features/auth/Logout';
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
export default function Home() {
  const logout = useLogout();
  const [userInfo, setUserInfo] = useState(null);
  const [instances, setInstances] = useState([]);
  const [limits, setLimits] = useState({ cpu: { used: 0, limit: 1 }, ram: { used: 0, limit: 1 }, storage: { used: 0, limit: 1 } });
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState('');
  const setTokenWithExpiry = (key, token, ttl = 3600000) => {
    const now = new Date();
    const item = {
      token,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiry = decoded.exp * 1000; // Convert to ms
        const now = Date.now();

        if (now < expiry) {
          setUserInfo(decoded);
          setCurrentProject(decoded?.project_id);
        } else {
          console.warn("Token expired");
          localStorage.removeItem('accessToken');
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get('/auth/user-projects/');
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectSwitch = async (projectId) => {
    try {
      const res = await axiosInstance.post('/auth/switch-project/', { project_id: projectId });
      if (res.data?.access) {
        localStorage.removeItem('accessToken');
        setTokenWithExpiry('accessToken', res.data.access);
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to switch project", err);
    }
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 6;
    const fetchInstances = async () => {
      try {
        const res = await axiosInstance.get('/overview/instances/');
        if (res.data && res.data.length > 0) {
          setInstances(res.data);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchInstances, 2000);
        } else {
          setInstances([]);
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
      <Navbar credits={150} />
      <div className="container mx-auto px-4 mt-10 md:mt-10">
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-3 mb-1">
            <div className="p-6 rounded-md shadow-md">
              <h1 className="text-3xl font-semibold text-gray-100">
                <span className="text-blue-400 font-bold text-3xl">{userInfo?.username || 'User'}</span>, dashboard ready.
              </h1>
            </div>
            <div className="flex justify-end items-center gap-3">
              <div className="flex items-center text-white text-sm min-w-[200px] space-x-2">
                <span className="whitespace-nowrap">Project:</span>
                <select
                  value={currentProject}
                  onChange={(e) => handleProjectSwitch(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-600 flex-1"
                >
                  {projects.length === 0 ? (
                    <option>Loading...</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p.openstack_id} value={p.openstack_id}>
                        {p.project_name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 group transition-all duration-200 ease-in-out cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-gray-300 group-hover:text-white transition" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"></path>
                </svg>
                <Link to="/profile">
                  <span className="hidden md:block text-gray-300 group-hover:text-white transition">
                    Account
                  </span>
                </Link>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="flex items-center space-x-2 p-2 rounded-md cursor-pointer text-white hover:bg-red-600 transition-all duration-200 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 16 16"
                >
                  <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2zm1 13h8V2H4v13z" />
                  <path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
                </svg>
                <span className="hidden md:inline-block text-sm whitespace-nowrap">Logout</span>
              </button>
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
