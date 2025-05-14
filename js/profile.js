import { api } from './api.js';
import { BarGraph, PieChart } from './graph.js';
import { profileData } from './queries.js';

export class ProfilePage {
  constructor() {
    // Create main container
    const container = document.createElement('div');
    container.className = 'profile-page';
    this.container = container;

    // Create content wrapper
    const content = document.createElement('div');
    content.className = 'profile-content';
    this.content = content;

    // Add content to container
    container.appendChild(content);

    console.log('ProfilePage initialized');
  }

  async render() {
    console.log('Starting profile render');

    // Check authentication
    const token = api.getToken();
    if (!token) {
      window.location.hash = '#/login';
      return this.container;
    }

    // Show loading state
    this.content.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2>Loading profile data...</h2>
        <p>Fetching your GraphQL profile information</p>
      </div>
    `;

    try {
      // Fetch data
      await profileData.fetchAllData();
      const userData = profileData.getUserData();
      const statsData = profileData.getStats();

      console.log('Rendering with data:', { userData, statsData });

      // Build content
      this.content.innerHTML = `
        <header class="profile-header">
          <div class="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div class="profile-welcome">
            <h2>Welcome${userData ? `, ${userData.login}` : ''}!</h2>
            <p class="profile-subtitle">Your GraphQL Profile Dashboard</p>
          </div>
        </header>

        <main class="profile-main">
          <h3 class="section-title">Profile Statistics</h3>
          <section class="profile-stats">
            <div class="profile-info-cards">
              <div class="profile-card active">
                <h3>User ID</h3>
                <p>${userData ? userData.id : 'No data'}</p>
              </div>
              <div class="profile-card">
                <h3>Total XP</h3>
                <p>${statsData ? statsData.totalXP.toLocaleString() : 'No data'}</p>
              </div>
              <div class="profile-card">
                <h3>Audit Pass Ratio</h3>
                <p>${statsData ? statsData.auditRatio : 'No data'}</p>
              </div>
            </div>
          </section>

          <h3 class="section-title">Performance Analytics</h3>
          <section class="profile-graphs">
            <div class="graph-container">
              <h3>XP Distribution</h3>
              <div id="graph-xp" class="graph"></div>
            </div>
            <div class="graph-container">
              <h3>Audit Results</h3>
              <div id="graph-passfail" class="graph"></div>
            </div>
          </section>
        </main>

        <footer class="profile-footer">
          <button id="logout-btn">
            <span>Logout</span>
          </button>
        </footer>
      `;

      // Add interactivity after content is in DOM
      this.setupInteractivity();

      // Render graphs
      await Promise.all([
        this.renderXPGraph(),
        this.renderPassFailChart()
      ]);

    } catch (error) {
      console.error('Error rendering profile:', error);
      this.content.innerHTML = `
        <div class="error-message">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#e74c3c">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2>Error Loading Profile</h2>
          <p>${error.message}</p>
          <button id="logout-btn">Return to Login</button>
        </div>
      `;
    }

    return this.container;
  }

  setupInteractivity() {
    // Logout button handler
    const logoutBtn = this.content.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        api.clearToken();
        window.location.hash = '#/login';
      });
    }

    // Card scroll effect
    const cardContainer = this.content.querySelector('.profile-info-cards');
    if (cardContainer) {
      const handleScroll = () => {
        const cards = cardContainer.querySelectorAll('.profile-card');
        const midX = cardContainer.scrollLeft + cardContainer.offsetWidth / 2;
        cards.forEach(card => {
          const cardMid = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardMid - midX);
          card.classList.toggle('active', dist < card.offsetWidth / 2);
        });
      };

      cardContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial state
    }
  }

  async renderXPGraph() {
    const container = this.content.querySelector('#graph-xp');
    if (!container) return;

    try {
      const data = profileData.getXPData();
      console.log('Rendering XP graph with data:', data);

      if (!data || data.length === 0) {
        container.innerHTML = '<p>No XP data available</p>';
        return;
      }

      const graph = new BarGraph(data, {
        width: 500,
        height: 300,
        barColor: '#3498db'
      });

      container.innerHTML = '';
      container.appendChild(graph.render());
    } catch (error) {
      console.error('Error rendering XP graph:', error);
      container.innerHTML = '<p>Failed to load XP graph</p>';
    }
  }

  async renderPassFailChart() {
    const container = this.content.querySelector('#graph-passfail');
    if (!container) return;

    try {
      const data = profileData.getAuditData();
      console.log('Rendering pass/fail chart with data:', data);

      if (!data || data.length === 0) {
        container.innerHTML = '<p>No audit data available</p>';
        return;
      }

      const pie = new PieChart(data, {
        width: 250,
        height: 250,
        colors: ['#2ecc71', '#e74c3c']
      });

      container.innerHTML = '';
      container.appendChild(pie.render());
    } catch (error) {
      console.error('Error rendering audit chart:', error);
      container.innerHTML = '<p>Failed to load audit chart</p>';
    }
  }
}
