import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/slice";
import cartReducer from "@/features/cart/slice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

export default rootReducer;
