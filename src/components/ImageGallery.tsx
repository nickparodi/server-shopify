import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ExternalLink } from 'lucide-react';

interface Image {
  _id: string;
  userId: string;
  publicId: string;
  url: string;
  caption: string;
  createdAt: string;
}

interface ImageGalleryProps {
  images: Image[];
  onDeleteImage: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDeleteImage }) => {
  if (images.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-gray-100 rounded-lg p-8">
          <p className="text-gray-600">You haven't uploaded any images yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <motion.div
          key={image._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card overflow-hidden group"
        >
          <div className="relative pb-[70%]">
            <img 
              src={image.url} 
              alt={image.caption || 'Uploaded image'} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <a 
                  href={image.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink size={16} className="text-gray-700" />
                </a>
                <button 
                  onClick={() => onDeleteImage(image._id)}
                  className="bg-white p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
          {image.caption && (
            <div className="p-4 border-t">
              <p className="text-gray-700 truncate">{image.caption}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ImageGallery;