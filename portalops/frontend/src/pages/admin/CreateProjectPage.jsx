import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "../../components/admin/Navbar";
import { useNavigate } from "react-router-dom";

const CreateProjectPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectTypes = async () => {
      try {
        const res = await axiosInstance.get("/project/project-packages/list/");
        setProjectTypes(res.data || []);
      } catch (error) {
        console.error("❌ Failed to fetch project types:", error);
      }
    };
    fetchProjectTypes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !selectedType) return alert("Name and Project Type are required.");

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        project_type_id: selectedType,
      };
      if (userId.trim()) {
        payload.user_id = userId;
      }

      await axiosInstance.post("/project/create-project/", payload);
      alert("✅ Project created successfully!");
      navigate("/admin/projects"); // or wherever your project list lives
    } catch (error) {
      console.error("❌ Project creation failed:", error);
      alert("❌ Project creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h2 className="text-3xl font-bold text-indigo-400 mb-6">🚀 Create New Project</h2>

        <form
          onSubmit={handleCreate}
          className="space-y-6 bg-black/40 p-8 rounded-2xl shadow-xl backdrop-blur-lg border border-gray-700"
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-300">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              placeholder="e.g., frontend-team"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              placeholder="Describe the purpose or scope of this project..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-300">Project Package *</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              required
            >
              <option value="">Select a project package...</option>
              {projectTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} – ${type.price_per_month}/mo
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-indigo-300">User ID (Optional)</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              placeholder="Assign to user ID (or leave blank)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition text-white shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "🚀 Create Project"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateProjectPage;
