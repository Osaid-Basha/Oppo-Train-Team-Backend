const multer = require("multer");
const path = require("path");
const fs = require("fs");

// تأكد إن فولدر uploads موجود
const uploadDir = path.join(__dirname, "../uploads/events");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
