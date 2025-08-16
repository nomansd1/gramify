import { z } from "zod";

export const getProfileSchema = {
  paramsSchema: z.object({
    username: z.string(),
  }),
};

export const updateProfileSchema = {
  bodySchema: z.object({
    name: z.string().min(1, "Name is required").optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .optional(),
    bio: z
      .string()
      .max(160, "Bio must be at most 160 characters long")
      .optional(),
    // profilePicture: z.any().optional(),
  }),
  paramsSchema: z.object({
    id: z.string(),
  }),
};
