import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(255, "Email is too long");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be less than 72 characters");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name cannot exceed 100 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"), // Don't validate min/max strictly on login to avoid leaking rules
});

export const signupSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const accountProfileSchema = z.object({
  full_name: nameSchema,
  job_title: z.string().max(100, "Job title cannot exceed 100 characters").optional().nullable(),
});

export const supportSchema = z.object({
  message: z.string().min(10, "Please provide more details").max(1000, "Message is too long"),
});

// Shared fields for contact editing & review
const contactFields = {
  full_name: nameSchema,
  company_name: z.string().max(100, "Company name cannot exceed 100 characters").optional().nullable(),
  designation: z.string().max(100, "Designation cannot exceed 100 characters").optional().nullable(),
  emails: z.string().max(255, "Emails cannot exceed 255 characters").optional().nullable(),
  phones: z.string().max(100, "Phones cannot exceed 100 characters").optional().nullable(),
  website: z.union([z.literal(""), z.string().url("Invalid URL").max(255, "URL too long")]).optional().nullable(),
  tags: z.string().max(255, "Tags cannot exceed 255 characters").optional().nullable(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
};

export const editContactSchema = z.object(contactFields);
export const reviewCardSchema = z.object(contactFields);
