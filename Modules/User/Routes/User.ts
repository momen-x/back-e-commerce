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
  updateUserInfo,
} from "../Controller/User";
import photoUpload from "../../../middlewares/photoUpload";
const router = express.Router();

router.route("/").get(verifyAdmin, getAllUsers).put(verifyTokenAndAuthorization,updateUserInfo);
router.route("/change-password").post(verifyTokenAndAuthorization,changePassword);

router
  .route("/:id")
  .get(verifyTokenAndAuthorization, getUserById)
  .delete(verifyTokenAndAuthorization, deleteUser);
  

  router.route("/photo-upload").post(VeriFyToken,photoUpload.single("image"),addProfileImage)

export default router;
