import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Header from "../../components/admin/Navbar";
import { toast } from "react-toastify";

export default function CreateInstanceAsAdminPage() {
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");
  const [imageId, setImageId] = useState("");
  const [flavorId, setFlavorId] = useState("");
  const [networkId, setNetworkId] = useState("");

  const [images, setImages] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [networks, setNetworks] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/project/projects/list/");
      setProjects(res.data || []);
    } catch {
      toast.error("❌ Failed to load project list.");
    }
  };

  const fetchOptions = async () => {
  try {
    const res = await axiosInstance.get("/openstack/instance-option/");
    const imageGroups = res.data.images || {};

    const allImages = [
      ...(imageGroups.distribution || []),
      ...(imageGroups.marketplace || []),
      ...(imageGroups.my_images || []),
      ...(imageGroups.iso || []),
    ];

    setImages(allImages);
    setFlavors(res.data.plans || []);
    setNetworks(res.data.networks || []);
  } catch {
    toast.error("❌ Failed to load instance options.");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!projectId || !name || !imageId || !flavorId || !networkId) {
      toast.error("⚠️ Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/admin/compute/instances/create", {
        project_id: projectId,
        name,
        image_id: imageId,
        flavor_id: flavorId,
        network_id: networkId,
      });

      toast.success(`✅ Instance "${res.data.instance.name}" created successfully.`);
      setProjectId("");
      setName("");
      setImageId("");
      setFlavorId("");
      setNetworkId("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "❌ Failed to create instance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
          <h1 className="text-3xl font-extrabold text-blue-400 drop-shadow">🛠️ Create Instance as Admin</h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Project Selector */}
            <ProjectSelector
  projects={projects}
  projectId={projectId}
  setProjectId={setProjectId}
/>


            {/* Name */}
            <section>
              <h2 className="text-xl font-semibold mb-2">2. Instance Name</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., admin-node-01"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </section>

            {/* Image */}
            <section>
              <h2 className="text-xl font-semibold mb-2">3. Select Image</h2>
              <select
                value={imageId}
                onChange={(e) => setImageId(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose an Image --</option>
                {images.map(img => (
                  <option key={img.id} value={img.id}>
                    {img.name || img.id}
                  </option>
                ))}
              </select>
            </section>

            {/* Flavor */}
            <section>
              <h2 className="text-xl font-semibold mb-2">4. Select Flavor</h2>
              <select
                value={flavorId}
                onChange={(e) => setFlavorId(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a Flavor --</option>
                {flavors.map(flv => (
                  <option key={flv.id} value={flv.id}>
                    {flv.label || flv.id}
                  </option>
                ))}
              </select>
            </section>

            {/* Network */}
            <section>
              <h2 className="text-xl font-semibold mb-2">5. Select Network</h2>
              <select
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a Network --</option>
                {networks.map(net => (
                  <option key={net.id} value={net.id}>
                    {net.name || net.id}
                  </option>
                ))}
              </select>
            </section>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700 mt-6">
              <div className="text-gray-400">
                🔐 Admin Project Deployment Tool
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Creating..." : "🚀 Create Instance"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

function ProjectSelector({ projects, projectId, setProjectId }) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const filteredProjects = projects.filter(
    (p) =>
     String(p.project_id).toLowerCase().includes(search.toLowerCase())
 ||
      (p.project_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    setProjectId(id);
    const selected = projects.find((p) => p.project_id === id);
    setSearch(`${selected?.project_name || "Unnamed"} (${id})`);
    setShowDropdown(false);
  };

  useEffect(() => {
    // Set label on initial load if value already selected
    if (projectId && !search) {
      const selected = projects.find((p) => p.project_id === projectId);
      if (selected) {
        setSearch(`${selected.project_name || "Unnamed"} (${selected.project_id})`);
      }
    }
  }, [projectId, projects]);

  return (
  <section ref={dropdownRef} className="relative mb-6">
    <label className="block text-lg font-semibold text-white mb-2">
      1. Select Project
    </label>

    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search project by name or ID"
        className="w-full px-4 py-3 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showDropdown && (
        <ul className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl shadow-2xl">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((p) => (
              <li
                key={p.project_id}
                className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white cursor-pointer transition duration-150"
                onClick={() => handleSelect(p.project_id)}
              >
                <div className="font-medium">{p.project_name || "Unnamed"}</div>
                <div className="text-sm text-gray-400">{p.project_id}</div>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400 italic">No matching projects</li>
          )}
        </ul>
      )}
    </div>
  </section>
);

}
