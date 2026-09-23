import express from "express";
import {
  verifyAdmin,
  verifyTokenAndAuthorization,
  VeriFyToken,
} from "../../../middlewares/verifyToken.js";
import { userController } from "../user.module.js";
import { upload } from "../../../middlewares/photoUpload.js";
const router = express.Router();

router
  .route("/")
  .get(verifyAdmin, userController.getAllUsers)
  .put(VeriFyToken, userController.updateUserInfo);
router
  .route("/password/change-password")
  .put(VeriFyToken, userController.changePassword);

router.route("/me").get(VeriFyToken, userController.getMe);

router
  .route("/photo-upload")
  .post(VeriFyToken, upload.single("image"), userController.addProfileImage);
router
  .route("/photo-delete")
  .delete(VeriFyToken, userController.deleteProfileImage);
router
  .route("/:id")
  .get(verifyTokenAndAuthorization, userController.getUserById)
  .delete(verifyTokenAndAuthorization, userController.deleteUser);

export default router;
