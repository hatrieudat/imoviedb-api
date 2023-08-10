import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg and .png files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // no larger than 1mb, you can change as needed.
  },
});

export default upload;
