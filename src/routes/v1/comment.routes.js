import { Router } from "express";
import { verifyJWT } from "../../middlewares/index.js";
import { createComment, getCommentsByPost, deleteComment, editComment } from "../../controllers/v1/comment.controllers.js";

const router = Router();

router.route("/:id/comments").post(verifyJWT, createComment);
router.route("/:id/comments").get(getCommentsByPost);
router.route("/comments/:id").delete(verifyJWT, deleteComment);
router.route("/comments/:id").patch(verifyJWT, editComment);

export default router;