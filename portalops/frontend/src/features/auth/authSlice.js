import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  roles: [],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.roles = action.payload.roles;

      // Lưu token và roles vào localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('roles', JSON.stringify(action.payload.roles));
      // Nếu có user info, bạn cũng có thể lưu:
      if(action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.roles = [];

      // Xóa dữ liệu khỏi localStorage khi logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('roles');
      localStorage.removeItem('user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;
