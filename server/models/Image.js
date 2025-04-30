import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Image = mongoose.model('Image', imageSchema);

export default Image;