import { Router } from "express";
import { verifyJWT } from "../../middlewares/index.js";
import { createComment, getCommentsByPost } from "../../controllers/v1/comment.controllers.js";

const router = Router();

router.route("/:id/comments").post(verifyJWT, createComment);
router.route("/:id/comments").get(getCommentsByPost);

export default router;