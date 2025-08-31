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

export const getAllChatsSchema = {
    querySchema: z.object({
        page: z.number().optional(),        
    }),
};

export const getMessagesSchema = {
    paramsSchema: z.object({
        id: z.string()
    }),
    querySchema: z.object({
        page: z.number()
    })    
};

export const editMessageSchema = {
    paramsSchema: z.object({
        id: z.string(),
        messageId: z.string()
    }),
    bodySchema: z.object({
        content: z.string().min(1, "Message content cannot be empty")
    }),
};

export const deleteMessageSchema = {
    paramsSchema: z.object({
        id: z.string(),
        messageId: z.string()        
    })
};