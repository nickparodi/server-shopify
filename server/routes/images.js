import express from 'express';
import Image from '../models/Image.js';
import { auth } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Get all images for current user
router.get('/', auth, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user._id })
                              .sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload a new image
router.post('/upload', auth, async (req, res) => {
  try {
    // Use the upload middleware configured in server.js
    req.upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }
      
      // Create a new image document
      const image = new Image({
        userId: req.user._id,
        publicId: req.file.filename,
        url: req.file.path,
        caption: req.body.caption || ''
      });
      
      await image.save();
      res.status(201).json(image);
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific image
router.get('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Delete from database
    await image.remove();
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;