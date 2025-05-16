// js/auth.js
import { api } from './api.js';
import { profileData } from './queries.js';

export class AuthPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50';
  }

  render() {
    const form = document.createElement('form');
    form.className = 'w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6';

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
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Login
      </button>
      <div class="error text-red-500 text-sm text-center mt-4 hidden" data-error></div>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = form.identifier.value.trim();
      const password = form.password.value.trim();
      const errorEl = form.querySelector('.error');

      try {
        await api.login(identifier, password);
        
        // Fetch all profile data before redirecting
        errorEl.textContent = 'Loading profile data...';
        await profileData.fetchAllData();
        
        window.location.hash = '#/profile';
      } catch (err) {
        console.error(err);
        errorEl.textContent = err.message || 'Login failed.';
      }
    });

    this.container.appendChild(form);
    return this.container;
  }
}
