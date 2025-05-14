import { router } from './router.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('DOMContentLoaded', () => this.render());
    window.addEventListener('hashchange', () => this.render());
  }

  async render() {
    const appContainer = document.getElementById('app');
    
    // Show loading state
    appContainer.innerHTML = '<div class="loading">Loading...</div>';

    try {
      const route = location.hash || '#/login';
      const component = router(route);

      if (component && typeof component.render === 'function') {
        // Handle both async and sync render methods
        const rendered = component.render();
        const content = rendered instanceof Promise ? await rendered : rendered;
        
        // Clear and append new content
        appContainer.innerHTML = '';
        appContainer.appendChild(content);
      } else {
        appContainer.innerHTML = `<h2>404 - Page Not Found</h2>`;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      appContainer.innerHTML = `
        <div class="error-message">
          <h2>Error Loading Page</h2>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
}

new App();
