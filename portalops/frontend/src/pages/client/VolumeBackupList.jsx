import React, { useEffect, useState } from "react";
import Navbar from "../../components/client/Navbar";
import axiosInstance from "../../api/axiosInstance";

const VolumeSnapshotListPage = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await axiosInstance.get("/openstack/image/instance-snapshots/");
        setSnapshots(res.data || []);
      } catch (err) {
        console.error("Failed to fetch snapshots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  return (
    <section className="min-h-screen text-white">
      <Navbar credits={150} />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-green-400 drop-shadow-md font-fantasy">
          My Volume Backups
        </h2>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              {[
                "Name",
                "Instance ID",
                "Status",
                "Size (GB)",
                "Created",
                "Snapshot ID",
              ].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading backups...
                </td>
              </tr>
            ) : snapshots.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No backup found.
                </td>
              </tr>
            ) : (
              snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-gray-900/30 transition">
                  <td className="px-6 py-4 font-medium">{snap.name}</td>
                  <td className="px-6 py-4 text-xs break-words">{snap.instance_id || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                        snap.status === "active"
                          ? "bg-green-800 text-green-300"
                          : snap.status === "error"
                          ? "bg-red-800 text-red-300"
                          : "bg-yellow-800 text-yellow-300"
                      }`}
                    >
                      {snap.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{(snap.size / (1024 ** 3))?.toFixed(2) || "-"}</td>
                  <td
                    className="px-6 py-4"
                    title={new Date(snap.created_at).toLocaleString()}
                  >
                    {new Date(snap.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs break-words">{snap.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default VolumeSnapshotListPage;
