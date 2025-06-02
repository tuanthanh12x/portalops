import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/Navbar";

const VolumeListPage = () => {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolumes = async () => {
      try {
        const res = await axiosInstance.get("/openstack/volumes/");
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
    <div className="min-h-screen bg-[#0f0f1c] text-white">
      <Navbar credits={150} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-200 font-fantasy">
            Volumes
          </h2>
          {/* Add Create Volume button if you want */}
          {/* <Link to="/create-volume" className="btn-class">+ Create Volume</Link> */}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading volumes...</div>
        ) : (
          <div className="bg-[#1a1a2e] rounded shadow p-4 overflow-auto border border-[#2c2c3e]">
            <div className="min-w-[800px] w-full">
              <div className="grid grid-cols-6 gap-4 bg-[#2c2c3e] text-gray-300 text-sm p-3 rounded-t">
                <div>Name</div>
                <div>Size (GB)</div>
                <div>Status</div>
                <div>Description</div>
                <div>Created</div>
                <div className="text-right">ID</div>
              </div>

              <div className="divide-y divide-[#33344a]">
                {volumes.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">No volumes found.</div>
                ) : (
                  volumes.map((volume) => (
                    <div
                      key={volume.id}
                      className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 p-3 hover:bg-[#26263b] text-gray-300"
                    >
                      <div>{volume.name || "-"}</div>
                      <div>{volume.size}</div>
                      <div
                        className={
                          volume.status === "available"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }
                      >
                        {volume.status}
                      </div>
                      <div>{volume.description || "-"}</div>
                      <div>{new Date(volume.created_at).toLocaleString()}</div>
                      <div className="text-right text-xs break-words">{volume.id}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VolumeListPage;
