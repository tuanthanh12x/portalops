import jwtDecode from "jwt-decode";

export function getProjectIdFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.project_id || false;
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
}
