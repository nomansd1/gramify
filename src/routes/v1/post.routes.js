import { Router } from "express";
import { verifyJWT, schemaValidate, upload } from "../../middlewares/index.js";
import { 
    createPost, 
    getPost, 
    deletePost, 
    updatePost, 
    likePost, 
    unlikePost, 
    likePostUsers, 
    getFeedPosts
} from "../../controllers/v1/post.controllers.js";
import { 
    createPostSchema, 
    getPostSchema, 
    deletePostSchema, 
    updatePostSchema 
} from "../../zod-schemas/post.schema.js";

const router = Router();

router.route("/create-post").post(
    verifyJWT,
    upload.fields([
        { 
            name: "media", 
            maxCount: 10,
            mimetype: [
                "image/jpeg", "image/png", 
                "image/gif", "image/webp", 
                "video/mp4", "video/mov", 
                "video/avi", "video/mkv"
            ],
            maxSize: 100 * 1024 * 1024,
        }
    ]),
    schemaValidate(createPostSchema),
    createPost
);
router.route("/get-post/:id").get(
    verifyJWT,
    schemaValidate(getPostSchema),
    getPost
);
router.route("/delete-post/:id").delete(
    verifyJWT,
    schemaValidate(deletePostSchema),
    deletePost
);
router.route("/update-post/:id").patch(
    verifyJWT,
    schemaValidate(updatePostSchema),
    updatePost
);
router.route("/:id/like").post(
    verifyJWT,
    likePost
);
router.route("/:id/unlike").post(
    verifyJWT,
    unlikePost
);
router.route("/:id/likes").get(
    verifyJWT,
    likePostUsers
);
router.route("/feed").get(verifyJWT, getFeedPosts);

export default router;