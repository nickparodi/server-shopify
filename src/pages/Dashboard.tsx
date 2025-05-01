import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Upload, Image as ImageIcon, User, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import ImageGallery from '../components/ImageGallery';
import Spinner from '../components/ui/Spinner';
import axios from 'axios';
import { format } from 'date-fns';

interface Image {
  _id: string;
  userId: string;
  publicId: string;
  url: string;
  caption: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('https://server-shopify-hscc.onrender.com/api/images');
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUploaded = (newImage: Image) => {
    setImages((prevImages) => [newImage, ...prevImages]);
    setShowUploader(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await axios.delete(`https://server-shopify-hscc.onrender.com/api/images/${imageId}`);
      setImages((prevImages) => prevImages.filter(image => image._id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const formatLastLogin = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp'); // Format: May 29, 2021, 12:34 PM
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Image Gallery</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut size={18} className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* User Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.name}!</h2>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center text-gray-600">
              <User size={18} className="mr-2" />
              <span>User ID: {user?._id}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2" />
              <span>Last Login: {user ? formatLastLogin(user.lastLogin) : 'Unknown'}</span>
            </div>
          </div>
        </motion.div>

        {/* Image Upload Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Images</h2>
          <button 
            onClick={() => setShowUploader(true)}
            className="btn-primary flex items-center"
          >
            <Upload size={18} className="mr-2" />
            Upload Image
          </button>
        </div>

        {/* Image Uploader Dialog */}
        {showUploader && (
          <ImageUploader 
            onClose={() => setShowUploader(false)} 
            onImageUploaded={handleImageUploaded}
          />
        )}

        {/* Image Gallery */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="large" />
          </div>
        ) : (
          <ImageGallery images={images} onDeleteImage={handleDeleteImage} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;