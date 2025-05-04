// API service for interacting with the backend

const API_URL = 'http://localhost:3000/api';

// Helper function to handle fetch requests
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('userToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // If response is not ok, throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Authentication
const AuthAPI = {
  // Register a new user
  signup: async (userData) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Login user
  login: async (credentials) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  // Get current user profile
  getProfile: async () => {
    return fetchWithAuth('/auth/profile');
  }
};

// Assets
const AssetsAPI = {
  // Get all assets for the current user
  getUserAssets: async () => {
    return fetchWithAuth('/assets');
  },
  
  // Get a single asset by ID
  getAssetById: async (assetId) => {
    return fetchWithAuth(`/assets/${assetId}`);
  },
  
  // Upload a new asset
  uploadAsset: async (formData) => {
    const token = localStorage.getItem('userToken');
    
    return fetch(`${API_URL}/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Do not set Content-Type for FormData
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || `HTTP error! Status: ${response.status}`);
        });
      }
      return response.json();
    });
  },
  
  // Delete an asset
  deleteAsset: async (assetId) => {
    return fetchWithAuth(`/assets/${assetId}`, {
      method: 'DELETE',
    });
  }
};

export { AuthAPI, AssetsAPI };