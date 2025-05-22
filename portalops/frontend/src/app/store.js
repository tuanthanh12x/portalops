import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import vmReducer from "../features/vm/vmSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vm: vmReducer,
  },
});
