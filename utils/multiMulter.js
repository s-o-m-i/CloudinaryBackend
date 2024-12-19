const multer = require('multer');
const path = require('path');

// Set storage location and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/stepforms'); // Directory for stepform images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Create an upload handler for multiple files without validation
const uploadStepFormFiles = multer({
  storage: storage,
}).array('stepFormFiles', 5); // Accepts up to 5 files

module.exports = uploadStepFormFiles;
