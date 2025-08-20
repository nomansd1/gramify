import { Router } from "express";
import { verifyJWT, schemaValidate, upload } from "../../middlewares/index.js";
import { getProfile, updateProfile, getProfilePosts } from "../../controllers/v1/profile.controllers.js";
import { updateProfileSchema, getProfileSchema, getProfilePostsSchema } from "../../zod-schemas/profile.schema.js";

const router = Router();

router.route("/:username").get(verifyJWT, schemaValidate(getProfileSchema), getProfile);
router.route("/edit-profile/:id").patch(
  verifyJWT,
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
      maxSize: 1024 * 1024 * 3,
      mimetypes: ["image/jpeg", "image/png", "image/webp"],
    }
  ]),
  schemaValidate(updateProfileSchema),
  updateProfile
);
router.route("/:username/posts").get(
  verifyJWT, 
  schemaValidate(getProfilePostsSchema), 
  getProfilePosts
);

export default router;