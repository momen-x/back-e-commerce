import express from "express";
import {
  verifyAdmin,
  verifyTokenAndAuthorization,
  VeriFyToken,
} from "../../../middlewares/verifyToken";
import {
  addProfileImage,
  changePassword,
  deleteUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUserInfo,
} from "../Controller/User";
import { upload } from "../../../middlewares/photoUpload";
const router = express.Router();

router
  .route("/")
  .get(verifyAdmin, getAllUsers)
  .put(VeriFyToken, updateUserInfo);
router.route("/password/change-password").put(VeriFyToken, changePassword);
router.route("/me").get(VeriFyToken, getMe);

router
  .route("/:id")
  .get(verifyTokenAndAuthorization, getUserById)
  .delete(verifyTokenAndAuthorization, deleteUser);

router
  .route("/photo-upload")
  .post(VeriFyToken, upload.single("image"), addProfileImage);

export default router;
