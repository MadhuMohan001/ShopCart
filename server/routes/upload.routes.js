import express from 'express';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/image', protect, isAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }
  res.json({
    success: true,
    data: {
      url: req.file.path,
      public_id: req.file.filename,
    },
  });
}));

router.post('/images', protect, isAdmin, upload.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }
  const images = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
  res.json({ success: true, data: images });
}));

export default router;
