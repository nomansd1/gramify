import { z } from "zod";

export const createChatSchema = {
    bodySchema: z.object({
        participants: z.array(z.string()).min(2, "At least two participants are required to create a chat"),
    }),
}; 