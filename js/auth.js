// js/auth.js
import { api } from './api.js';
import { profileData } from './queries.js';

export class AuthPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'auth-page';
  }

  render() {
    const form = document.createElement('form');
    form.className = 'login-form';

    form.innerHTML = `
      <h2>Login</h2>
      <label>
        Username or Email:
        <input type="text" name="identifier" required />
      </label>
      <label>
        Password:
        <input type="password" name="password" required />
      </label>
      <button type="submit">Login</button>
      <div class="error" style="color:red; margin-top: 10px;"></div>
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
