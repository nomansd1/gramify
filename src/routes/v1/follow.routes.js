import { Router } from "express";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../../controllers/v1/follow.controllers.js";
import { verifyJWT } from "../../middlewares/index.js";

const router = Router();

router.route("/:id").post(verifyJWT, followUser);
router.route("/unfollow-user/:id").delete(verifyJWT, unfollowUser);
router.route("/followers/:id").get(verifyJWT, getFollowers);
router.route("/following/:id").get(verifyJWT, getFollowing);

export default router;