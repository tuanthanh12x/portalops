// src/utils/getUserInfoFromToken.js
import { jwtDecode } from 'jwt-decode';

export default function getUserInfoFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return {
      username: decoded.username || decoded.name || '',
      email: decoded.email || '',
      roles: decoded.roles || [],
      project: decoded.project_id || '',
    };
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}
