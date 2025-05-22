// src/features/auth/Logout.js
import { useDispatch } from 'react-redux';
import { logout } from './authSlice';

export function useLogout() {
  const dispatch = useDispatch();

  return () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Gửi action logout
    dispatch(logout());

    // Chuyển hướng về trang login
    window.location.href = '/login';
  };
}
