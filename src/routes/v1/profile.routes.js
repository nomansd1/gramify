import { Router } from "express";
import { verifyJWT, schemaValidate, upload } from "../../middlewares/index.js";
import { getProfile, updateProfile } from "../../controllers/v1/profile.controllers.js";
import { updateProfileSchema, getProfileSchema } from "../../zod-schemas/profile.schema.js";

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

export default router;