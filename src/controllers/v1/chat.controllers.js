import { StatusCodes } from "http-status-codes";
import { asyncHandler, ApiError, ApiResponse } from "../../utils/index.js";
import prisma from "../../db/index.js";

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
          id: { in: participants },
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
    res
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

  res
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
            updatedAt: 'desc',
        },
    });

    res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Chats retrieved", chats));
});