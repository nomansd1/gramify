import { Router } from "express";
import { verifyJWT } from "../../middlewares/index.js";
import { likePost, unlikePost } from "../../controllers/v1/like.controllers.js";

const router = Router();

router.route("/like").post(verifyJWT, likePost);
router.route("/unlike").post(verifyJWT, unlikePost);

export default router;