import { Router } from "express";
import { verifyJWT, schemaValidate, upload } from "../../middlewares/index.js";
import { uploadStory, getSpecificStory, deleteStory, getFollowingUsersStories } from "../../controllers/v1/story.controllers.js";

const router = Router();

router.route("/").post(
  verifyJWT,
  upload.fields([
    {
      name: "story",
      maxCount: 1,
      mimetype: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/mkv",
      ],
      maxSize: 100 * 1024 * 1024,
    },
  ]),
  uploadStory
);
router.route("/:id").get(verifyJWT, getSpecificStory);
router.route("/:id").delete(verifyJWT, deleteStory);
router.route("").get(verifyJWT, getFollowingUsersStories);

export default router;