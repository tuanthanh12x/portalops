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


      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('roles', JSON.stringify(action.payload.roles));

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


      localStorage.removeItem('accessToken');
      localStorage.removeItem('roles');
      localStorage.removeItem('user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;
