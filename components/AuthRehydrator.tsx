"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAuth } from "@/features/auth/slice";
import api from "@/lib/axios";

/**
 * AuthRehydrator
 * ──────────────
 * On every app mount (including hard refresh), silently calls /api/auth/me.
 * Tries USER session first, then ADMIN session.
 * If a valid session cookie exists server-side, we dispatch setAuth so the
 * UI never wrongly shows "not authenticated" after a refresh.
 */
const AuthRehydrator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || isAuthenticated) return;
    didRun.current = true;

    const tryRehydrate = async () => {
      try {
        // Try user session
        const res = await api.get("/auth/me");
        const data = res.data?.data;
        if (data?.user) {
          dispatch(setAuth({ user: data.user }));
          return;
        }
      } catch {
        // No user session — try admin
        try {
          const res = await api.get("/auth/me?role=ADMIN");
          const data = res.data?.data;
          if (data?.user) {
            dispatch(setAuth({ user: data.user }));
          }
        } catch {
          // No session at all — silently ignore
        }
      }
    };

    tryRehydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default AuthRehydrator;
