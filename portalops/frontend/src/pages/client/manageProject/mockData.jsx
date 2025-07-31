// src/data/mockData.js
import axiosInstance from "../../../api/axiosInstance";

export const fetchRealProjects = async () => {
  try {
    const response = await axiosInstance.get("/project/project-list");
    return response.data.map((project) => {
      const type = project.type;

      return {
        id: project.id,
        openstack_id: project.openstack_id,
        description: project.description || "No description provided",
        status: type ? "Active" : "Stopped",
        created: new Date(project.created_at).toISOString().split("T")[0],
        package: type?.name || "Unassigned",
        pricing: {
          monthly: type ? parseFloat(type.price_per_month) : 0,
          currency: "USD",
        },
        region: "default-region", // add real region if available
      };
    });
  } catch (err) {
    console.error("❌ Failed to fetch projects:", err);
    return [];
  }
};
export const fetchPackageOptions = async () => {
  try {
    const response = await axiosInstance.get("/project/project-packages/list/");
    return response.data.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: parseFloat(pkg.price_per_month),
      vcpus: pkg.vcpus,
      memory: `${pkg.ram / 1024} GB`,
      storage: `${pkg.total_volume_gb} GB`,
      color: getPackageColorByName(pkg.name),
      description: pkg.description || "No description provided",
    }));
  } catch (err) {
    console.error("❌ Failed to fetch packages:", err);
    return [];
  }
};
const getPackageColorByName = (name) => {
  const lower = name.toLowerCase();

  if (lower.includes("basic")) return "bg-blue-500";
  if (lower.includes("standard")) return "bg-purple-500";
  if (lower.includes("premium")) return "bg-orange-500";
  if (lower.includes("enterprise") || lower.includes("luxury")) return "bg-red-500";
  if (lower.includes("diamond")) return "bg-cyan-500";

  return "bg-gray-500"; // default
};