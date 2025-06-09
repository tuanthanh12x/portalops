import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

import { Link } from 'react-router-dom';
const VolumeListPage = () => {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const res = await axiosInstance.get("/openstack/storage/volumes/");
        setVolumes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch volumes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVolumes();
  }, []);

  return (
    <section className="min-h-screen text-white">
      <Navbar credits={150} />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex justify-between items-center mb-1 mt-8 px-4 py-6">
        <h2 className="text-4xl font-bold tracking-tight text-green-400 drop-shadow-md font-fantasy">
          💾 Volumes
        </h2>

        <Link
          to="/create-volume"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Create Volume
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Size (GB)</th>
              <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Source Type</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-left">Created</th>
              <th className="px-6 py-4 text-right">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading volumes...
                </td>
              </tr>
            ) : volumes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No volumes found.
                </td>
              </tr>
            ) : (
              volumes.map((volume) => (
                <tr
                  key={volume.id}
                  className="hover:bg-gray-900/30 transition"
                >
                  <td className="px-6 py-4 font-medium">{volume.name || "-"}</td>
                  <td className="px-6 py-4">{volume.size}</td>
                  <td className="px-6 py-4">{volume.type}</td>
                  <td className="px-6 py-4">{volume.source_type}</td>
                  <td className={`px-6 py-4 font-semibold ${volume.status === "available" ? "text-green-400" : "text-yellow-400"
                    }`}>
                    {volume.status}
                  </td>
                  <td className="px-6 py-4">{volume.description || "-"}</td>
                  <td className="px-6 py-4">{new Date(volume.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-xs break-words font-mono">{volume.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default VolumeListPage;
