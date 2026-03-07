import path from "path";
import multer from "multer";
//photo storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      const date = new Date().getTime().toString().replace(/:/g, "-");

      cb(null, date + "-" + file.originalname);
    } else {
      cb(null, "");
    }
  },
});

//photo upload middleware
const photoUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb({ message: "only images are allowed" } as any, false);
    }
  },
  limits: { fileSize: 1024 * 1024 *2} ,//2 MB
});

export default photoUpload;
