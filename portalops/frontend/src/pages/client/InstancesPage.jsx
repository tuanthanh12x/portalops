import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import InstancesTable from "../../components/InstancesTable";
import Navbar from "../../components/Navbar";

const MyInstancesPage = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const res = await axiosInstance.get("/overview/instances/");
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
    <div className="min-h-screen bg-[#0f0f1c] text-white">
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

export default MyInstancesPage;
