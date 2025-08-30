import { z } from "zod";

export const createChatSchema = {
    bodySchema: z.object({
        participants: z.array(z.string()).min(2, "At least two participants are required to create a chat"),
    }),
};

export const sendMessageSchema = {
    bodySchema: z.object({
        content: z.string().min(1, "Message content cannot be empty"),
    }),
    paramsSchema: z.object({
        id: z.string(),
    }),
};
