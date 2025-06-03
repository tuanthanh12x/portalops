import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/Navbar";

const KeypairListPage = () => {
  const [keypairs, setKeypairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeypairs = async () => {
      try {
        const res = await axiosInstance.get("/openstack/compute/keypair/");
        setKeypairs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch keypairs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKeypairs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1c] text-white">
      <Navbar credits={150} />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-200 font-fantasy">
            Keypairs
          </h2>
          <Link
            to="/create-keypair"
            className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
          >
            + Create Keypair
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading keypairs...</div>
        ) : (
          <div className="bg-[#1a1a2e] rounded shadow p-4 overflow-auto border border-[#2c2c3e]">
            <div className="min-w-[1000px] w-full">
              <div className="grid grid-cols-4 gap-4 bg-[#2c2c3e] text-gray-300 text-sm p-3 rounded-t">
                <div>Name</div>
                <div>Fingerprint</div>
                <div>Type</div>
                <div>Public Key</div>
              </div>

              <div className="divide-y divide-[#33344a]">
                {keypairs.map((kp, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 p-3 hover:bg-[#26263b] text-gray-300 text-sm break-words"
                  >
                    <div>{kp.name}</div>
                    <div className="text-xs">{kp.fingerprint}</div>
                    <div>{kp.type}</div>
                    <div className="text-xs">{kp.public_key.slice(0, 60)}...</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KeypairListPage;
