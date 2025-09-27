import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  bulkUploadOnImageKit,
  deleteFromImageKit,
} from "../../utils/index.js";

export const createPost = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { caption } = req.body;

  const files = req.files?.media || [];

  const hasNedia = files.length > 0;

  if (!hasNedia) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please upload at least one image or one video."
    );
  }

  let localMedia = [],
    cloudMedia = [];
  const folderPath = `users/${id}/posts`;

  files.forEach((file) => {
    localMedia.push({
      type: file.mimetype,
      url: file.path,
    });
  });

  if (localMedia.length > 0) {
    cloudMedia = await bulkUploadOnImageKit(localMedia, folderPath);
  }

  if (cloudMedia.length > 0) {
    try {
      const post = await prisma.post.create({
        data: {
          userId: id,
          ...(caption && { caption }),
          media: {
            create: cloudMedia.map((media) => ({
              type: media.type,
              url: media.url,
              fileId: media.fileId,
            })),
          },
        },
        select: {
          id: true,
          caption: true,
          createdAt: true,
          updatedAt: true,
          media: {
            select: {
              id: true,
              type: true,
              url: true,
            },
          },
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

      return res
        .status(StatusCodes.CREATED)
        .json(
          new ApiResponse(
            StatusCodes.CREATED,
            "Post created successfully",
            post
          )
        );
    } catch (error) {
      if (cloudMedia.length > 0) {
        for (const media of cloudMedia) {
          await deleteFromImageKit(media.fileId);
        }
      }

      throw error;
    }
  }
});

export const getPost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const id = req.user.id;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      userId: id,
    },
    select: {
      id: true,
      caption: true,
      createdAt: true,
      updatedAt: true,
      media: {
        select: {
          id: true,
          type: true,
          url: true,
        },
      },
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

  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not found or you do not have permission to view this post."
    );
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Post retrieved successfully", post));
}); 

export const deletePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const id = req.user.id;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      userId: id,
    },
    select: {
      id: true,
      media: {
        select: {
          fileId: true,
        },
      },
    },
  });

  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not found or you do not have permission to delete this post."
    );
  }

  if (post.media.length > 0) {
    for (const media of post.media) {
      await deleteFromImageKit(media.fileId);
    }
  }

  await prisma.$transaction([
    prisma.media.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Post deleted successfully"));
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const id = req.user.id;
  const { caption } = req.body;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
      userId: id,
    },
    select: {
      caption: true,
    },
  });

  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not found or you do not have permission to update this post."
    );
  }

  const updatedPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      caption: caption || post.caption,
    },
    select: {
      id: true,
      caption: true,
      createdAt: true,
      updatedAt: true,
      media: {
        select: {
          id: true,
          type: true,
          url: true,
        },
      },
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
    .json(new ApiResponse(StatusCodes.OK, "Post updated successfully", updatedPost));
});

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

export const likePostUsers = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      likes: {
        skip,
        take: limit,
        select: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const users = post.likes.map((like) => like.user);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Users who liked the post", users));
});

export const getFeedPosts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  if (following.length === 0) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "You are not following anyone. Follow users to see their posts in your feed."
    );
  }

  const followingIds = following.map((f) => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caption: true,
      createdAt: true,
      updatedAt: true,
      media: {
        select: {
          id: true,
          type: true,
          url: true,
        },
      },
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

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Feed posts retrieved successfully", posts));
});