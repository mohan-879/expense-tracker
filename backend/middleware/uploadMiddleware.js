const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const uploadDirs = ['receipts', 'payment_proofs', 'sponsor_logos'];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', 'uploads', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure Multer storage
const createStorage = (subDir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(__dirname, '..', 'uploads', subDir);
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      // Generate secure unique filename
      const ext = path.extname(file.originalname).toLowerCase();
      const cleanName = file.originalname
        .replace(ext, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
    },
  });
};

// File Filter for receipts, proofs, and logos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, JPEG, PNG) and PDFs are allowed!'));
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB max
};

const uploadReceipt = multer({
  storage: createStorage('receipts'),
  fileFilter,
  limits,
}).single('receipt');

const uploadPaymentProof = multer({
  storage: createStorage('payment_proofs'),
  fileFilter,
  limits,
}).single('paymentProof');

const uploadSponsorLogo = multer({
  storage: createStorage('sponsor_logos'),
  fileFilter,
  limits,
}).single('logo');

module.exports = {
  uploadReceipt,
  uploadPaymentProof,
  uploadSponsorLogo,
};
