import { StatusCodes } from "http-status-codes";
import { asyncHandler, ApiError, ApiResponse } from "../../utils/index.js";
import prisma from "../../db/index.js";
import { getSocket } from "../../utils/socket.js";

export const createChat = asyncHandler(async (req, res) => {
  const { participants } = req.body;

  const authenticatedUser = participants.includes(req.user.id);
  if (!authenticatedUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Authenticated user must be a participant in the chat"
    );
  }

  const existingUsers = await prisma.user.findMany({
    where: {
      id: { in: participants },
    },
    select: { id: true },
  });

  if (existingUsers.length !== participants.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "One or more participants do not exist"
    );
  }

  const existingChat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: participants },
        },
      },
    },
    select: {
      id: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (existingChat) {
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, "Chat already exists", existingChat)
      );
  }

  const newChat = await prisma.chat.create({
    data: {
      participants: {
        create: participants.map((userId) => ({
          user: { connect: { id: userId } },
        })),
      },
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  // Emit socket event to all participants
  const io = getSocket();
  participants.forEach((userId) => {
    io.to(userId).emit("chat:created", newChat);
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, "Chat created", newChat));
});

export const getAllChats = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  const userId = req.user.id;

  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    skip: skip,
    take: limit,
    orderBy: {
      updatedAt: "desc",
    },
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Chats retrieved", chats));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { id: chatId } = req.params;
  const senderId = req.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: true,
    },
  });

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  const isParticipant = chat.participants.some(
    (participant) => participant.userId === senderId
  );

  if (!isParticipant) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not a participant of this chat"
    );
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          profilePicture: true,
        },
      },
    },
  });

  // Update chat's updatedAt timestamp
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  // Emit socket event to all participants
  const io = getSocket();
  chat.participants.forEach((participant) => {
    io.to(participant.userId).emit("message:received", message);
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, "Message sent", message));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
      messages: {
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          updatedAt: true,
          isEdited: true,
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found!");
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Messages Retrieved!", chat));
});

export const editMessage = asyncHandler(async (req, res) => {
  const { id: chatId, messageId } = req.params;
  const { content } = req.body;
  const currentUser = req.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true },
  });

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true },
  });

  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
  }

  if (message.senderId !== currentUser) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to edit this message"
    );
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      isEdited: true,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      isEdited: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        "Message updated successfully",
        updatedMessage
      )
    );
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { id: chatId, messageId } = req.params;
  const currentUser = req.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true },
  });

  if (!chat) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true },
  });

  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
  }

  if (message.senderId !== currentUser) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this message"
    );
  }

  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Message deleted successfully", {}));
});