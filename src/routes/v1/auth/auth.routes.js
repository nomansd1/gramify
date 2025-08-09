import { Router } from "express";
import { schemaValidate, verifyJWT } from "../../../middlewares/index.js";
import { registerUserSchema, loginUserSchema } from "../../../zod-schemas/auth.schema.js"; 
import { registerUser, loginUser, logoutUser } from "../../../controllers/v1/auth.controllers.js";

const router = Router();

router.post('/register', schemaValidate(registerUserSchema), registerUser);
router.post('/login', schemaValidate(loginUserSchema), loginUser);
router.post('/logout', verifyJWT, logoutUser);

export default router;