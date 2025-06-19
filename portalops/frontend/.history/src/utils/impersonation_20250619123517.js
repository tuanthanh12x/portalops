// src/utils/impersonation.js
import axiosInstance from "../api/axiosInstance";

export async function impersonateUser(userId, projectId) {
  const res = await axiosInstance.post("/api/auth/impersonate-usertoken/", {
    user_id: userId,
    project_id: projectId,
  });

  const { access_token, username, project_id } = res.data;

  sessionStorage.setItem("impersonation_token", access_token);
  sessionStorage.setItem("impersonated_username", username);
  sessionStorage.setItem("impersonated_project_id", project_id);

  window.location.href = "/client/dashboard";
}
