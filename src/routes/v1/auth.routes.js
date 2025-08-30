import { Router } from "express";
import { schemaValidate, verifyJWT } from "../../middlewares/index.js";
import { registerUserSchema, loginUserSchema } from "../../zod-schemas/auth.schema.js"; 
import { registerUser, loginUser, logoutUser, changePassword } from "../../controllers/v1/auth.controllers.js";

const router = Router();

router.post('/register', schemaValidate(registerUserSchema), registerUser);
router.post('/login', schemaValidate(loginUserSchema), loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/change-password', changePassword)

export default router;