const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimeType = (file.mimetype || '').toLowerCase();
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return cb(
      new Error(`Only the following image formats are accepted: ${ALLOWED_TYPES.join(', ')}`),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
  },
});

module.exports = upload;
