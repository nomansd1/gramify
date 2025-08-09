import { Router } from "express";
import { verifyJWT, schemaValidate } from "../../middlewares/index.js";
import { getProfile, updateProfile } from "../../controllers/v1/profile.controllers.js";
import { updateProfileSchema, getProfileSchema } from "../../zod-schemas/profile.schema.js";

const router = Router();

router.route("/:username").get(verifyJWT, schemaValidate(getProfileSchema), getProfile);
router.route("/:id").patch(
  verifyJWT,
  schemaValidate(updateProfileSchema),
  updateProfile
);

export default router;