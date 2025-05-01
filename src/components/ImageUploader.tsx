import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import Spinner from './ui/Spinner';

interface Image {
  _id: string;
  userId: string;
  publicId: string;
  url: string;
  caption: string;
  createdAt: string;
}

interface ImageUploaderProps {
  onClose: () => void;
  onImageUploaded: (image: Image) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onClose, onImageUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create a preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      
      // Upload to server
      const response = await axios.post('https://server-shopify-hscc.onrender.com/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onImageUploaded(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Upload Image</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {!preview ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview('');
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label htmlFor="caption" className="form-label">Caption (optional)</label>
              <input
                id="caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="form-input"
                placeholder="Add a caption to your image"
                maxLength={100}
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Spinner size="small" /> 
                    <span className="ml-2">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageUploader;