import { z } from "zod";

export const createPostSchema = {
  bodySchema: z.object({
    caption: z
      .string()
      .max(2200, "Caption must be at most 2200 characters long")
      .optional(),
  }),
};

export const getPostSchema = {
  paramsSchema: z.object({
    id: z.string(),
  }),
};

export const deletePostSchema = {
  paramsSchema: z.object({
    id: z.string(),
  }),
};

export const updatePostSchema = {
  paramsSchema: z.object({
    id: z.string(),
  }),
  bodySchema: z.object({
    caption: z
      .string()
      .max(2200, "Caption must be at most 2200 characters long")
  }),
};

