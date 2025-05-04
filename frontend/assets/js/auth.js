import { AuthAPI } from './api.js';
import { showToast, isValidEmail, redirectIfLoggedIn } from './utils.js';

// Redirect if already logged in
redirectIfLoggedIn();

// Common function to initialize auth forms
function initAuthForms() {
  const loginForm = document.getElementById('shop-custom-login-form');
  const signupForm = document.getElementById('shop-custom-signup-form');
  const loginLink = document.getElementById('shop-custom-login-link');
  const signupLink = document.getElementById('shop-custom-signup-link');
  
  if (loginForm && signupForm) {
    // Show login form, hide signup form by default
    loginForm.classList.add('shop-custom-auth-form-visible');
    signupForm.classList.add('shop-custom-auth-form-hidden');
    
    // Toggle between login and signup forms
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('shop-custom-auth-form-hidden');
        signupForm.classList.remove('shop-custom-auth-form-visible');
        loginForm.classList.remove('shop-custom-auth-form-hidden');
        loginForm.classList.add('shop-custom-auth-form-visible');
      });
    }
    
    if (signupLink) {
      signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('shop-custom-auth-form-hidden');
        loginForm.classList.remove('shop-custom-auth-form-visible');
        signupForm.classList.remove('shop-custom-auth-form-hidden');
        signupForm.classList.add('shop-custom-auth-form-visible');
      });
    }
  }
  
  // Initialize login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Initialize signup form
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('shop-custom-login-email').value;
  const password = document.getElementById('shop-custom-login-password').value;
  const loginBtn = document.getElementById('shop-custom-login-btn');
  const errorElement = document.querySelector('.shop-custom-auth-error');
  
  // Validate input
  if (!email || !password) {
    if (errorElement) {
      errorElement.textContent = 'Please enter both email and password.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  if (!isValidEmail(email)) {
    if (errorElement) {
      errorElement.textContent = 'Please enter a valid email address.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  try {
    // Show loading state
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<div class="shop-custom-loading"></div><span>Logging in...</span>';
      loginBtn.classList.add('shop-custom-btn-loading');
    }
    
    // Hide any previous errors
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    // Call the login API
    const userData = await AuthAPI.login({ email, password });
    
    // Store the JWT token
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userData', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      email: userData.email
    }));
    
    // Show success message and redirect
    showToast('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/pages/dashboard.html';
    }, 1000);
    
  } catch (error) {
    // Display error message
    if (errorElement) {
      errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
      errorElement.style.display = 'block';
      
      // Add shake animation
      errorElement.classList.add('shop-custom-auth-shake');
      setTimeout(() => {
        errorElement.classList.remove('shop-custom-auth-shake');
      }, 500);
    }
    
    // Reset loading state
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Login';
      loginBtn.classList.remove('shop-custom-btn-loading');
    }
  }
}

// Handle signup form submission
async function handleSignup(e) {
  e.preventDefault();
  
  const username = document.getElementById('shop-custom-signup-username').value;
  const email = document.getElementById('shop-custom-signup-email').value;
  const password = document.getElementById('shop-custom-signup-password').value;
  const confirmPassword = document.getElementById('shop-custom-signup-confirm-password').value;
  const signupBtn = document.getElementById('shop-custom-signup-btn');
  const errorElement = document.querySelector('.shop-custom-auth-error');
  
  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    if (errorElement) {
      errorElement.textContent = 'Please fill in all fields.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  if (!isValidEmail(email)) {
    if (errorElement) {
      errorElement.textContent = 'Please enter a valid email address.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  if (password.length < 6) {
    if (errorElement) {
      errorElement.textContent = 'Password must be at least 6 characters long.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  if (password !== confirmPassword) {
    if (errorElement) {
      errorElement.textContent = 'Passwords do not match.';
      errorElement.style.display = 'block';
    }
    return;
  }
  
  try {
    // Show loading state
    if (signupBtn) {
      signupBtn.disabled = true;
      signupBtn.innerHTML = '<div class="shop-custom-loading"></div><span>Creating account...</span>';
      signupBtn.classList.add('shop-custom-btn-loading');
    }
    
    // Hide any previous errors
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    // Call the signup API
    const userData = await AuthAPI.signup({ username, email, password });
    
    // Store the JWT token
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userData', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      email: userData.email
    }));
    
    // Show success message and redirect
    showToast('Account created successfully! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/pages/dashboard.html';
    }, 1000);
    
  } catch (error) {
    // Display error message
    if (errorElement) {
      errorElement.textContent = error.message || 'Signup failed. Please try again.';
      errorElement.style.display = 'block';
      
      // Add shake animation
      errorElement.classList.add('shop-custom-auth-shake');
      setTimeout(() => {
        errorElement.classList.remove('shop-custom-auth-shake');
      }, 500);
    }
    
    // Reset loading state
    if (signupBtn) {
      signupBtn.disabled = false;
      signupBtn.innerHTML = 'Create Account';
      signupBtn.classList.remove('shop-custom-btn-loading');
    }
  }
}

// Initialize the auth forms when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthForms);