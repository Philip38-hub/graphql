// js/auth.js
import { api } from './api.js';
import { profileData } from './queries.js';

export class AuthPage {
  constructor() {
    // Create main container with matching gradient
    this.container = document.createElement('div');
    this.container.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-300 relative overflow-hidden';
    
    // Create spotlight element for cursor effect
    const spotlight = document.createElement('div');
    spotlight.className = 'absolute pointer-events-none opacity-0 transition-opacity duration-300';
    spotlight.style.background = 'radial-gradient(circle 200px at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)';
    spotlight.style.width = '400px';
    spotlight.style.height = '400px';
    spotlight.style.transform = 'translate(-50%, -50%)';
    spotlight.style.zIndex = '0';
    this.spotlight = spotlight;
    this.container.appendChild(spotlight);
  }

  render() {
    // Create form with consistent styling
    const form = document.createElement('form');
    form.className = 'w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6 relative z-10';

    form.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">View Your ZONE01 profile</h2>
        <p class="text-gray-500">Please login to continue</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Username or Email
        </label>
        <input 
          type="text" 
          name="identifier" 
          required 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your username or email"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input 
          type="password" 
          name="password" 
          required 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your password"
        />
      </div>
      <button 
        type="submit" 
        class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
      >
        Login
      </button>
      <div class="error text-red-500 text-sm text-center mt-4 hidden"></div>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = form.identifier.value.trim();
      const password = form.password.value.trim();
      const errorEl = form.querySelector('.error');
      errorEl.classList.remove('hidden');

      try {
        // Show loading state
        errorEl.textContent = 'Logging in...';
        errorEl.classList.remove('text-red-500');
        errorEl.classList.add('text-primary-600');
        
        await api.login(identifier, password);
        
        // Fetch all profile data before redirecting
        errorEl.textContent = 'Loading profile data...';
        await profileData.fetchAllData();
        
        window.location.hash = '#/profile';
      } catch (err) {
        console.error(err);
        errorEl.textContent = err.message || 'Login failed.';
        errorEl.classList.add('text-red-500');
        errorEl.classList.remove('text-primary-600');
      }
    });

    this.container.appendChild(form);
    
    // Setup cursor spotlight effect
    this.setupCursorSpotlight();
    
    return this.container;
  }
  
  setupCursorSpotlight() {
    const container = this.container;
    const spotlight = this.spotlight;
    
    // Show spotlight when mouse enters container
    container.addEventListener('mouseenter', () => {
      spotlight.style.opacity = '1';
    });
    
    // Hide spotlight when mouse leaves container
    container.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
    
    // Move spotlight to follow cursor
    container.addEventListener('mousemove', (e) => {
      // Get position relative to container
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Position the spotlight at cursor
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;
    });
  }
}
