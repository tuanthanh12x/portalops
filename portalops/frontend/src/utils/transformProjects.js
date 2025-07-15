// src/utils/transformProjects.js
export const transformProjectsFromAPI = (apiProjects) => {
  return apiProjects.map((proj) => {
    const pkg = proj.type;

    return {
      id: proj.id,
      name: proj.name,
      description: proj.description || "No description provided",
      status: pkg ? "Active" : "Stopped",
      created: new Date(proj.created_at).toISOString().split("T")[0],
      package: pkg?.name || "Unassigned",
      pricing: {
        monthly: pkg ? parseFloat(pkg.price_per_month) : 0,
        currency: "USD"
      },
      region: "default-region" // Replace with real region if you have it
    };
  });
};
