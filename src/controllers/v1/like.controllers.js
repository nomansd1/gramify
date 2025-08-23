import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

export const likePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const existingLike = await prisma.like.findFirst({
    where: { postId, userId },
  });

  if (existingLike) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have already liked this post"
    );
  }

  await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, "Post liked successfully"));
});

export const unlikePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const existingLike = await prisma.like.findFirst({
    where: { postId, userId },
  });

  if (!existingLike) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have not liked this post"
    );
  }

  await prisma.like.delete({
    where: { id: existingLike.id },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Post unliked successfully"));
});

export const getPostLikes = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Likes retrieved successfully", likes));
});