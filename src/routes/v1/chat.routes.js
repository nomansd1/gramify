import { Router } from "express";
import { verifyJWT, schemaValidate } from "../../middlewares/index.js";
import {
  createChat,
  getAllChats,
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
} from "../../controllers/v1/chat.controllers.js";
import {
  createChatSchema,
  deleteMessageSchema,
  editMessageSchema,
  getAllChatsSchema,
  getMessagesSchema,
  sendMessageSchema,
} from "../../zod-schemas/chat.schema.js";

const router = Router();

router.route("/").post(verifyJWT, schemaValidate(createChatSchema), createChat);
router
  .route("/")
  .get(verifyJWT, schemaValidate(getAllChatsSchema), getAllChats);
router
  .route("/:id/message")
  .post(verifyJWT, schemaValidate(sendMessageSchema), sendMessage);
router
  .route("/:id")
  .get(verifyJWT, schemaValidate(getMessagesSchema), getMessages);
router
  .route("/:id/messages/:messageId")
  .patch(verifyJWT, schemaValidate(editMessageSchema), editMessage);
router
  .route("/:id/messages/:messageId")
  .delete(verifyJWT, schemaValidate(deleteMessageSchema), deleteMessage);

export default router;