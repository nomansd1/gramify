import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

export const createComment = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { id: userId } = req.user;
  const { content } = req.body;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, "Comment created successfully", comment));
});

export const getCommentsByPost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Comments fetched successfully", comments));
});
