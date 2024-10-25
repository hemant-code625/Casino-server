import { Router } from "express";
import {
  changeCurrentPassword,
  getUser,
  loginUser,
  logOutUser,
  registerUser,
  saveBankDetails,
  updateRefreshToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", upload.none(), registerUser);

router.post("/login", upload.none(), loginUser); // upload.none() is used to parse the form data that doesn't contain any files

router.post("/logout", verifyJWT, logOutUser);
router.post("/refresh-token", updateRefreshToken);

router.post("/save-bank-details", verifyJWT, saveBankDetails);

router.post("/change-password", verifyJWT, changeCurrentPassword);
router.post("/user", verifyJWT, getUser);

export default router;
