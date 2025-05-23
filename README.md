# Image Gallery Full-Stack Application

A full-stack web application with React.js frontend and Node.js backend featuring user authentication, Cloudinary image uploads, and a responsive gallery view.

## Features

- User authentication (signup/login) with JWT
- MongoDB integration for user data storage
- Dynamic welcome dashboard with user info and last login time
- Cloudinary integration for image uploads and storage
- Responsive image gallery with card displays and hover effects
- Modern UI with subtle animations and responsive design

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests
- React Hook Form for form handling
- React Dropzone for file uploads

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Cloudinary for image storage
- Multer for file handling

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB (local or Atlas)
- Cloudinary account

### Setup

1. Clone the repository

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
```

4. Create a `.env` file in the server directory based on `.env.example`
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the development servers
```bash
# Start frontend and backend concurrently
npm run dev:all

# Or start separately
npm run dev        # Frontend
npm run server     # Backend
```

## Deployment

The application can be deployed to Render:

1. Frontend: Deploy as a static site
2. Backend: Deploy as a web service
3. Configure environment variables on Render dashboard

## License

This project is licensed under the MIT License.#   s e r v e r - s h o p i f y  
 #   s e r v e r - s h o p i f y  
 