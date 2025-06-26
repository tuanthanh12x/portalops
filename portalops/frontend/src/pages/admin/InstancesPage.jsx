import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import InstancesTable from "../../components/admin/InstancesTable";
import Navbar from "../../components/admin/Navbar";
import Popup from "../../components/client/Popup";
const InstancesPage = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const res = await axiosInstance.get("/admin/overview/instances/");
        setInstances(res.data || []);
      } catch (err) {
        console.error("Failed to fetch instances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <Navbar credits={150} />

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading instances...</div>
        ) : (
          <InstancesTable instances={instances} />
        )}
      </main>
    </div>
  );
};

export default InstancesPage;
