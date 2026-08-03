import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppNotification } from "./types";

interface NotificationsState {
  list: AppNotification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  list: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<AppNotification>) {
      // Add to front of list so newest shows first
      state.list.unshift(action.payload);
      // Keep only last 50 notifications
      if (state.list.length > 50) {
        state.list = state.list.slice(0, 50);
      }
      state.unreadCount += 1;
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
    clearAll(state) {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, clearUnread, clearAll } = notificationsSlice.actions;
export default notificationsSlice.reducer;
