import multer from "multer";
import path from "path";

// Configure the storage engine for multer
const storage = multer.diskStorage({
  // @param {Object}   request object.
  // @param {Object}   The uploaded file.
  // @param {function} cb - The callback function to specify the destination folder.
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  //   @param {Object}  request object.
  //   @param {Object}  The uploaded file.
  //  @param {function} cb - The callback function to specify the filename.

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "image-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("only jpg , jpeg and png allowed"));
    }
  },
});
