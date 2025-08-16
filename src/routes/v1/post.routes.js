import { Router } from "express";
import { verifyJWT, schemaValidate, upload } from "../../middlewares/index.js";
import { createPost, deletePost } from "../../controllers/v1/post.controllers.js";
import { createPostSchema, deletePostSchema } from "../../zod-schemas/post.schema.js";

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
router.route("/delete-post/:id").delete(
    verifyJWT,
    schemaValidate(deletePostSchema),
    deletePost
);


export default router;