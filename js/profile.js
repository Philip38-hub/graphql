// js/profile.js
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
    this.content.innerHTML = '<h2>Loading profile data...</h2>';

    try {
      // Fetch data
      await profileData.fetchAllData();
      const userData = profileData.getUserData();
      const statsData = profileData.getStats();
      
      console.log('Rendering with data:', { userData, statsData });

      // Build content
      this.content.innerHTML = `
        <header class="profile-header">
          <h2>Welcome${userData ? `, ${userData.login}` : ''}</h2>
        </header>

        <main class="profile-main">
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

          <section class="profile-graphs">
            <div class="graph-container">
              <h3>XP Distribution</h3>
              <div id="graph-xp"></div>
            </div>
            <div class="graph-container">
              <h3>Audit Results</h3>
              <div id="graph-passfail"></div>
            </div>
          </section>
        </main>

        <footer class="profile-footer">
          <button id="logout-btn">Logout</button>
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
