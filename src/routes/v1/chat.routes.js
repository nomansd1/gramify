import { Router } from "express";
import { verifyJWT, schemaValidate } from "../../middlewares/index.js";
import {
  createChat,
  getAllChats,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage
} from "../../controllers/v1/chat.controllers.js";
import {
  createChatSchema,
  sendMessageSchema,
  
} from "../../zod-schemas/chat.schema.js";

const router = Router();

router.route("/").post(verifyJWT, schemaValidate(createChatSchema), createChat);
router.route("/").get(verifyJWT, getAllChats);
router
  .route("/:id/message")
  .post(verifyJWT, schemaValidate(sendMessageSchema), sendMessage);
router.route("/:id").get(verifyJWT, getMessages);
router.route("/:id/messages/:messageId").patch(verifyJWT, editMessage);
router.route("/:id/messages/:messageId").delete(verifyJWT, deleteMessage);

export default router;
