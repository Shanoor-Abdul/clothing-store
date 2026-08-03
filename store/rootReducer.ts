import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/slice";
import cartReducer from "@/features/cart/slice";
import notificationsReducer from "@/features/notifications/notificationsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  notifications: notificationsReducer,
});

export default rootReducer;
