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

export const deleteComment = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;
  const { id: userId } = req.user;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
  }

  if (comment.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to delete this comment");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Comment deleted successfully", null));
});

export const editComment = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;
  const { id: userId } = req.user;
  const { content } = req.body;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
  }

  if (comment.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to edit this comment");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { 
      content, 
      isEdited: true
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
          username: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Comment updated successfully", updatedComment));
});
