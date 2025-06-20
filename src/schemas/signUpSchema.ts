import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special charaters")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
                    .max(100, { message: "Password must not exceed 100 characters" })
                    .regex(/^\S*$/, { message: "Password must not contain spaces" })
});
