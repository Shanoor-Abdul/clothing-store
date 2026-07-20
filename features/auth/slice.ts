import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AuthUser } from "./types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: "ADMIN" | "USER" | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ user: AuthUser }>
    ) {
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
    },
    clearAuth(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
