import { z } from "zod";

export const registerUserSchema = {
  bodySchema: z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
};

export const loginUserSchema = {
  bodySchema: z.object({
    email: z.string().email("Invalid email address").optional(),
    username: z.string().min(3, "Username must be at least 3 characters long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  })
  .refine(
    (data) => data.email || data.username,
    {
      message: "Either email or username is required",
      path: ["email"],
    }
  ),
};

