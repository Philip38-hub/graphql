// js/app.js
import { router } from './router.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('DOMContentLoaded', () => this.render());
    window.addEventListener('hashchange', () => this.render());
  }

  render() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = ''; // Clear previous content

    const route = location.hash || '#/login';
    const component = router(route);

    if (component && typeof component.render === 'function') {
      appContainer.appendChild(component.render());
    } else {
      appContainer.innerHTML = `<h2>404 - Page Not Found</h2>`;
    }
  }
}

new App();
