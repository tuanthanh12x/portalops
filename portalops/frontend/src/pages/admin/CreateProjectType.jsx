import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Popup from "../../components/client/Popup";
import Header from "../../components/admin/Navbar";

export default function CreateFlavorPage() {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    vcpus: "",
    ram: "",
    disk: "",
    swap: "",
    ephemeral: "",
    price_per_month: "",
    description: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("openstack/compute/create-flavor/", formData);
      setPopup({ message: "✅ Flavor & Project Type created successfully." });
      setFormData({
        name: "",
        vcpus: "",
        ram: "",
        disk: "",
        swap: "",
        ephemeral: "",
        price_per_month: "",
        description: "",
      });
      navigate("/flavors-manager");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "❌ Failed to create flavor/project type."
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white">
      <Header />
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <div className="backdrop-blur-lg bg-black/40 border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-green-400 text-center drop-shadow">
            ⚙️ Create Flavor & Project Type
          </h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/40 py-2 px-3 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Flavor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              label="vCPUs"
              name="vcpus"
              type="number"
              value={formData.vcpus}
              onChange={handleChange}
            />
            <InputField
              label="RAM (MB)"
              name="ram"
              type="number"
              value={formData.ram}
              onChange={handleChange}
            />
            <InputField
              label="Disk (GB)"
              name="disk"
              type="number"
              value={formData.disk}
              onChange={handleChange}
            />
            <InputField
              label="Swap (MB)"
              name="swap"
              type="number"
              value={formData.swap}
              onChange={handleChange}
            />
            <InputField
              label="Ephemeral (GB)"
              name="ephemeral"
              type="number"
              value={formData.ephemeral}
              onChange={handleChange}
            />
            <InputField
              label="Price per month ($)"
              name="price_per_month"
              type="number"
              value={formData.price_per_month}
              onChange={handleChange}
            />
            <InputField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              ➕ Create Flavor & Project Type
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
        required
      />
    </div>
  );
}
