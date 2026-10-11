const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ID_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === "images" && !IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "images (must be JPEG, PNG, or WebP)"));
  }
  if (file.fieldname === "video" && !VIDEO_TYPES.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "video (must be MP4, WebM, or MOV)"));
  }
  cb(null, true);
}

const uploadPgMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
}).fields([
  { name: "images", maxCount: 6 },
  { name: "video", maxCount: 1 },
]);

function idProofFileFilter(req, file, cb) {
  if (file.fieldname === "idProofDocument" && !ID_PROOF_TYPES.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "ID proof (must be JPEG, PNG, WebP, or PDF)"));
  }
  cb(null, true);
}

const uploadIdProof = multer({
  storage,
  fileFilter: idProofFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("idProofDocument");

module.exports = uploadPgMedia;
module.exports.uploadPgMedia = uploadPgMedia;
module.exports.uploadIdProof = uploadIdProof;
