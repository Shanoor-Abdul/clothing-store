import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
});

export const UserLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
});

export const UserRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .trim()
    .min(8, "Enter a valid mobile number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
});

export interface AdminLoginFormData {
  email: string;
  password: string;
}

export interface UserLoginFormData {
  email: string;
  mobile: string;
  password: string;
}

export interface UserRegisterFormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}
