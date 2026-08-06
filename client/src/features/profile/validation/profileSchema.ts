import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(40, "Name must be less than 40 characters."),

  email: z.email("Please enter a valid email address."),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    passwordConfirm: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  });

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;
