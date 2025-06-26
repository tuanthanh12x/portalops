import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/client/Navbar";

export const CreateNetworkPage = () => {
  const [form, setForm] = useState({
    name: "",
    cidr: "",
    gateway_ip: "",
    enable_dhcp: true,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/openstack/network/create-network/", form);
      navigate("/dashboard/networks");
    } catch (error) {
      console.error("Failed to create network:", error);
    }
  };

  return (
    <section className="min-h-screen text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-green-400 mb-6">➕ Create Private Network</h2>
        <form onSubmit={handleSubmit} className="bg-black/30 p-6 rounded-xl border border-gray-700">
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Network Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-800 text-white" required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Subnet CIDR</label>
            <input name="cidr" value={form.cidr} onChange={handleChange} placeholder="192.168.0.0/24" className="w-full px-4 py-2 rounded bg-gray-800 text-white" required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Gateway IP</label>
            <input name="gateway_ip" value={form.gateway_ip} onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-800 text-white" required />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" name="enable_dhcp" checked={form.enable_dhcp} onChange={handleChange} />
            <label className="font-medium">Enable DHCP</label>
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">
            🚀 Create Network
          </button>
        </form>
      </div>
    </section>
  );
};

export const CreateFloatingIPPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAllocate = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/openstack/floatingip/create/");
      navigate("/dashboard/networks");
    } catch (error) {
      console.error("Failed to allocate floating IP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen text-white">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4">🌐 Allocate Floating IP</h2>
        <p className="text-gray-300 mb-6">Click the button below to allocate a new floating IP to your project.</p>
        <button
          onClick={handleAllocate}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-semibold"
        >
          {loading ? "Allocating..." : "➕ Allocate IP"}
        </button>
      </div>
    </section>
  );
};
