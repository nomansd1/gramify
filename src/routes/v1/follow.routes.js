import { Router } from "express";
import { followUser, unfollowUser } from "../../controllers/v1/follow.controllers.js";
import { verifyJWT } from "../../middlewares/index.js";

const router = Router();

router.route("/:id").post(verifyJWT, followUser);
router.route("/unfollow-user/:id").delete(verifyJWT, unfollowUser);

export default router;