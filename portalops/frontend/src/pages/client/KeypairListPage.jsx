import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

const KeypairListPage = () => {
  const [keypairs, setKeypairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

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

 const handleCopy = (key, name) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key)
      .then(() => {
        setCopiedKey(name);
        setTimeout(() => setCopiedKey(null), 1500);
      })
      .catch((err) => {
        console.error("Clipboard write failed:", err);
      });
  } else {
    // Fallback for unsupported environments
    const textarea = document.createElement("textarea");
    textarea.value = key;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopiedKey(name);
        setTimeout(() => setCopiedKey(null), 1500);
      } else {
        alert("❌ Copy failed. Please copy manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      alert("❌ Copy not supported.");
    }
    document.body.removeChild(textarea);
  }
};


  return (
    <section className="min-h-screen text-white">
      <Navbar credits={150} />

      <header className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-between mb-1 mt-8">
        <h2 className="text-4xl font-bold tracking-tight text-green-400 drop-shadow-md font-fantasy">
          🔑 My Keypairs
        </h2>
        <Link
          to="/create-keypair"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          + Create Keypair
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl overflow-x-auto rounded-xl bg-black/30 backdrop-blur-lg shadow-xl border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Fingerprint</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Public Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500 font-medium">
                  ⏳ Loading keypairs...
                </td>
              </tr>
            ) : keypairs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500 font-medium">
                  🚫 No keypairs found.
                </td>
              </tr>
            ) : (
              keypairs.map((kp, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-900/30 transition"
                >
                  <td className="px-6 py-4 font-medium">{kp.name}</td>
                  <td className="px-6 py-4 text-xs font-mono">{kp.fingerprint}</td>
                  <td className="px-6 py-4">{kp.type}</td>
                  <td className="px-6 py-4 flex items-center justify-between gap-2 text-xs font-mono break-all">
                    <span>{kp.public_key.slice(0, 60)}...</span>
                    <button
                      onClick={() => handleCopy(kp.public_key, kp.name)}
                      className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs text-white transition"
                    >
                      {copiedKey === kp.name ? "Copied!" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default KeypairListPage;
