// src/features/auth/Logout.js
import { useDispatch } from 'react-redux';
import { logout } from './authSlice';

export function useLogout() {
  const dispatch = useDispatch();

  return () => {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Gửi action logout
    dispatch(logout());


    window.location.href = '/login';
  };
}
