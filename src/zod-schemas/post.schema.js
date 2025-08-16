import { z } from "zod";

export const createPostSchema = {
  bodySchema: z.object({
    caption: z
      .string()
      .max(2200, "Caption must be at most 2200 characters long")
      .optional(),
  }),
};

export const deletePostSchema = {
  paramsSchema: z.object({
    id: z.string(),
  }),
};

