import { Router } from "express";
import { verifyJWT, schemaValidate } from "../../middlewares/index.js";
import { createChat, getAllChats } from "../../controllers/v1/chat.controllers.js";
import { createChatSchema } from "../../zod-schemas/chat.schema.js";

const router = Router();

router.route("/").post(verifyJWT, schemaValidate(createChatSchema), createChat);
router.route("/").get(verifyJWT, getAllChats);

export default router;