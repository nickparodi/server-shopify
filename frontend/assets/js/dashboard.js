import { AuthAPI, AssetsAPI } from './api.js';
import { 
  showToast, 
  formatDate, 
  getInitials, 
  requireAuth, 
  formatFileSize,
  truncateText,
  isImageFile
} from './utils.js';

// Check if user is logged in, redirect if not
if (!requireAuth()) {
  // This will redirect to login page if not authenticated
  // The function is in utils.js
}

let userData = null;
let userAssets = [];

// Initialize the dashboard
async function initDashboard() {
  setupUserInfo();
  setupLogout();
  setupUploadModal();
  await fetchUserData();
  await fetchUserAssets();
}

// Set up user info display
function setupUserInfo() {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    userData = JSON.parse(storedUserData);
    updateUserUI(userData);
  }
}

// Update user interface with user data
function updateUserUI(user) {
  const userNameElement = document.getElementById('shop-custom-user-name');
  const userEmailElement = document.getElementById('shop-custom-user-email');
  const userAvatarElement = document.getElementById('shop-custom-user-avatar');
  
  if (userNameElement && user.username) {
    userNameElement.textContent = user.username;
  }
  
  if (userEmailElement && user.email) {
    userEmailElement.textContent = user.email;
  }
  
  if (userAvatarElement && user.username) {
    userAvatarElement.textContent = getInitials(user.username);
  }
}

// Set up logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById('shop-custom-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear local storage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      
      // Redirect to login page
      window.location.href = '/pages/login.html';
    });
  }
}

// Fetch user data from API
async function fetchUserData() {
  try {
    const user = await AuthAPI.getProfile();
    userData = user;
    updateUserUI(user);
    
    // Update local storage with fresh data
    localStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    showToast('Failed to load user profile. Please try logging in again.', 'error');
    console.error('Error fetching user data:', error);
  }
}

// Fetch user assets from API
async function fetchUserAssets() {
  try {
    const assets = await AssetsAPI.getUserAssets();
    userAssets = assets;
    renderAssets(assets);
  } catch (error) {
    showToast('Failed to load your assets.', 'error');
    console.error('Error fetching assets:', error);
    renderEmptyState();
  }
}

// Render assets in the grid
function renderAssets(assets) {
  const assetGrid = document.getElementById('shop-custom-asset-grid');
  if (!assetGrid) return;
  
  // Clear existing assets
  assetGrid.innerHTML = '';
  
  if (assets.length === 0) {
    renderEmptyState();
    return;
  }
  
  // Render each asset
  assets.forEach(asset => {
    const assetCard = createAssetCard(asset);
    assetGrid.appendChild(assetCard);
  });
}

// Create a card for an asset
function createAssetCard(asset) {
  const card = document.createElement('div');
  card.className = 'shop-custom-asset-card shop-custom-fadeIn';
  
  const isImage = asset.resourceType === 'image';
  const previewUrl = isImage ? asset.cloudinaryUrl : 'https://via.placeholder.com/300x200?text=File';
  
  card.innerHTML = `
    <div class="shop-custom-asset-preview">
      <img src="${previewUrl}" alt="${asset.name}" />
    </div>
    <div class="shop-custom-asset-info">
      <h3 class="shop-custom-asset-title">${asset.name}</h3>
      <div class="shop-custom-asset-meta">
        Added on ${formatDate(asset.createdAt)}
      </div>
      <div class="shop-custom-asset-tags">
        <span class="shop-custom-asset-tag">${asset.assetType}</span>
        ${asset.metadata?.productType ? `<span class="shop-custom-asset-tag">${asset.metadata.productType}</span>` : ''}
      </div>
    </div>
    <div class="shop-custom-asset-actions">
      <a href="${asset.cloudinaryUrl}" target="_blank" class="shop-custom-btn shop-custom-btn-outline">
        View
      </a>
      <button class="shop-custom-btn shop-custom-btn-outline shop-custom-delete-asset" data-id="${asset._id}">
        Delete
      </button>
    </div>
  `;
  
  // Add delete functionality
  const deleteBtn = card.querySelector('.shop-custom-delete-asset');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteAsset(asset._id, card));
  }
  
  return card;
}

// Render empty state when no assets
function renderEmptyState() {
  const assetGrid = document.getElementById('shop-custom-asset-grid');
  if (!assetGrid) return;
  
  assetGrid.innerHTML = `
    <div class="shop-custom-empty-state">
      <div class="shop-custom-empty-icon">📁</div>
      <h3 class="shop-custom-empty-text">No assets found</h3>
      <p>Upload your first asset to get started</p>
      <button id="shop-custom-empty-upload-btn" class="shop-custom-btn shop-custom-btn-primary shop-custom-mt-3">
        Upload Asset
      </button>
    </div>
  `;
  
  // Add click handler for the upload button
  const uploadBtn = document.getElementById('shop-custom-empty-upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => openUploadModal());
  }
}

// Delete an asset
async function deleteAsset(assetId, cardElement) {
  if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
    return;
  }
  
  try {
    await AssetsAPI.deleteAsset(assetId);
    
    // Remove from UI with animation
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      cardElement.remove();
      
      // If no assets left, show empty state
      if (document.querySelectorAll('.shop-custom-asset-card').length === 0) {
        renderEmptyState();
      }
    }, 300);
    
    showToast('Asset deleted successfully.', 'success');
    
  } catch (error) {
    showToast('Failed to delete asset.', 'error');
    console.error('Error deleting asset:', error);
  }
}

// Set up the upload modal
function setupUploadModal() {
  const uploadBtn = document.getElementById('shop-custom-upload-btn');
  const modal = document.getElementById('shop-custom-upload-modal');
  const closeBtn = document.getElementById('shop-custom-modal-close');
  const cancelBtn = document.getElementById('shop-custom-cancel-upload');
  const fileInput = document.getElementById('shop-custom-file-input');
  const fileDropArea = document.getElementById('shop-custom-file-drop');
  const previewContainer = document.getElementById('shop-custom-file-preview');
  const uploadForm = document.getElementById('shop-custom-upload-form');
  
  // Selected file storage
  let selectedFile = null;
  
  // Open modal
  if (uploadBtn) {
    uploadBtn.addEventListener('click', openUploadModal);
  }
  
  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeUploadModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeUploadModal);
  }
  
  // Handle click outside the modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeUploadModal();
      }
    });
  }
  
  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelection(e.target.files);
    });
  }
  
  // Handle drag and drop
  if (fileDropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      fileDropArea.classList.add('shop-custom-file-highlight');
    }
    
    function unhighlight() {
      fileDropArea.classList.remove('shop-custom-file-highlight');
    }
    
    fileDropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFileSelection(files);
    });
    
    // Clicking the drop area also triggers file selection
    fileDropArea.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  // Handle form submission
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!selectedFile) {
        showToast('Please select a file to upload.', 'error');
        return;
      }
      
      const name = document.getElementById('shop-custom-asset-name').value || selectedFile.name;
      const description = document.getElementById('shop-custom-asset-description').value;
      const assetType = document.getElementById('shop-custom-asset-type').value;
      
      // Get metadata fields
      const productType = document.getElementById('shop-custom-product-type').value;
      const sizes = document.getElementById('shop-custom-sizes').value;
      const colors = document.getElementById('shop-custom-colors').value;
      
      // Create metadata object
      const metadata = {
        productType: productType || undefined,
        sizes: sizes ? sizes.split(',').map(s => s.trim()) : undefined,
        colors: colors ? colors.split(',').map(c => c.trim()) : undefined
      };
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('assetType', assetType);
      formData.append('metadata', JSON.stringify(metadata));
      
      try {
        // Show loading state
        const submitBtn = document.getElementById('shop-custom-submit-upload');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<div class="shop-custom-loading"></div><span>Uploading...</span>';
          submitBtn.classList.add('shop-custom-btn-loading');
        }
        
        // Upload the asset
        const result = await AssetsAPI.uploadAsset(formData);
        
        // Close the modal
        closeUploadModal();
        
        // Show success message
        showToast('Asset uploaded successfully.', 'success');
        
        // Refresh the assets list
        await fetchUserAssets();
        
      } catch (error) {
        showToast('Failed to upload asset.', 'error');
        console.error('Error uploading asset:', error);
        
        // Reset the submit button
        const submitBtn = document.getElementById('shop-custom-submit-upload');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Upload';
          submitBtn.classList.remove('shop-custom-btn-loading');
        }
      }
    });
  }
  
  // Handle file selection
  function handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    // Get the first file
    selectedFile = files[0];
    
    // Update the name field with the file name
    const nameInput = document.getElementById('shop-custom-asset-name');
    if (nameInput && !nameInput.value) {
      nameInput.value = selectedFile.name;
    }
    
    // Auto-detect asset type based on file extension
    const assetTypeSelect = document.getElementById('shop-custom-asset-type');
    if (assetTypeSelect) {
      if (isImageFile(selectedFile.name)) {
        assetTypeSelect.value = 'image';
      } else if (selectedFile.name.endsWith('.json')) {
        assetTypeSelect.value = 'json';
      }
    }
    
    // Clear previous previews
    if (previewContainer) {
      previewContainer.innerHTML = '';
      
      // Show file info
      const fileInfo = document.createElement('div');
      fileInfo.className = 'shop-custom-file-info shop-custom-mb-2';
      fileInfo.innerHTML = `
        <p><strong>${selectedFile.name}</strong></p>
        <p class="shop-custom-text-sm">${formatFileSize(selectedFile.size)}</p>
      `;
      previewContainer.appendChild(fileInfo);
      
      // Show image preview if it's an image
      if (isImageFile(selectedFile.name)) {
        const img = document.createElement('img');
        img.className = 'shop-custom-file-preview-img shop-custom-mb-2';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '200px';
        img.style.borderRadius = 'var(--shop-custom-radius-md)';
        
        // Read the file and create a preview
        const reader = new FileReader();
        reader.onload = function(e) {
          img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
        
        previewContainer.appendChild(img);
      }
    }
  }
}

// Open the upload modal
function openUploadModal() {
  const modal = document.getElementById('shop-custom-upload-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Reset the form
    const uploadForm = document.getElementById('shop-custom-upload-form');
    if (uploadForm) {
      uploadForm.reset();
    }
    
    const previewContainer = document.getElementById('shop-custom-file-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    
    // Reset the submit button
    const submitBtn = document.getElementById('shop-custom-submit-upload');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Upload';
      submitBtn.classList.remove('shop-custom-btn-loading');
    }
  }
}

// Close the upload modal
function closeUploadModal() {
  const modal = document.getElementById('shop-custom-upload-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);