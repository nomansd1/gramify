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

  console.log("files", req.files);

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

    console.log("cloudMedia", cloudMedia);
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
