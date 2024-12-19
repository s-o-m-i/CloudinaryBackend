const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Specify the directory to save the uploaded files
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Generate a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Preserve file extension
    },
  });
  const upload = multer({ storage });

  module.exports = upload