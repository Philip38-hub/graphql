// js/profile.js
import { api } from './api.js';
import { BarGraph, PieChart, WebChart } from './graph.js';
import { profileData } from './queries.js';

export class ProfilePage {
  constructor() {
    // Create main container
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50';
    this.container = container;

    // Create content wrapper
    const content = document.createElement('div');
    content.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8';
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
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-xl shadow-xl text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Loading profile data...</h2>
          <p class="text-gray-500">Fetching your GraphQL profile information</p>
        </div>
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
        <header class="profile-header bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="profile-avatar w-32 h-32 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="white" class="w-16 h-16">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div class="profile-welcome text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome${userData ? `, ${userData.login}` : ''}!</h2>
            <p class="text-gray-500">Your GraphQL Profile Dashboard</p>
          </div>
        </header>

        <main class="profile-main space-y-8">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4">Profile Statistics</h3>
          <section class="profile-stats">
            <div class="profile-info-cards grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="profile-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">User ID</h3>
                <p class="text-2xl font-bold text-primary-600">${userData ? userData.id : 'No data'}</p>
              </div>
              <div class="profile-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Total XP</h3>
                <p class="text-2xl font-bold text-green-600">${statsData ? statsData.totalXP.toLocaleString() : 'No data'}</p>
              </div>
              <div class="profile-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Audit Pass Ratio</h3>
                <p class="text-2xl font-bold text-blue-600">${statsData ? statsData.auditRatio : 'No data'}</p>
              </div>
            </div>
          </section>

          <h3 class="text-2xl font-semibold text-gray-800 mb-4">Performance Analytics</h3>
          <section class="profile-graphs grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="graph-container bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-semibold text-gray-700 mb-4">XP Distribution</h3>
              <div id="graph-xp" class="graph"></div>
            </div>
            <div class="graph-container bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-xl font-semibold text-gray-700 mb-4">Audit Results</h3>
              <div id="graph-passfail" class="graph"></div>
            </div>
          </section>

          <h3 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">Skills Overview</h3>
          <section class="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
            <div id="skills-chart" class="graph flex justify-center items-center min-h-[350px]"></div>
          </section>
        </main>

        <footer class="profile-footer mt-12">
          <button id="logout-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
            <span>Logout</span>
          </button>
        </footer>
      `;

      // Add interactivity after content is in DOM
      this.setupInteractivity();

      // Render graphs
      await Promise.all([
        this.renderXPGraph(),
        this.renderPassFailChart(),
        this.renderSkillsChart()
      ]);

    } catch (error) {
      console.error('Error rendering profile:', error);
      this.content.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-xl shadow-xl text-center">
            <svg viewBox="0 0 24 24" width="48" height="48" class="text-red-500 mx-auto mb-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p class="text-gray-500 mb-4">${error.message}</p>
            <button id="logout-btn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
              Return to Login
            </button>
          </div>
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

  async renderXPProgressChart() {
    const container = this.content.querySelector('#graph-progress');
    if (!container) return;

    try {
      const data = profileData.getXPProgressData();
      console.log('Rendering XP progress chart with data:', data);

      if (!data || data.length === 0) {
        container.innerHTML = '<p>No XP progress data available</p>';
        return;
      }

      const lineGraph = new LineGraph(data, {
        width: 500,
        height: 300,
        lineColor: '#3498db',
        areaColor: 'rgba(52, 152, 219, 0.2)',
        pointColor: '#2980b9'
      });

      container.innerHTML = '';
      container.appendChild(pie.render());
    } catch (error) {
      console.error('Error rendering audit chart:', error);
      container.innerHTML = '<p>Failed to load audit chart</p>';
    }
  }

  async renderSkillsChart() {
    const container = this.content.querySelector('#skills-chart');
    if (!container) return;

    try {
      const data = profileData.getSkillsData();
      console.log('Rendering skills chart with data:', data);

      if (!data || data.length < 3) {
        container.innerHTML = '<p class="text-gray-500 text-center">Not enough skills data available</p>';
        return;
      }

      // Clear container
      container.innerHTML = '';
      
      const chart = new WebChart(data, {
        width: Math.min(container.clientWidth - 40, 350),
        height: 350,
        maxValue: 100,
        levels: 5,
        color: '#6366f1', // Tailwind indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Tailwind indigo-500 with opacity
        labelColor: '#4b5563' // Tailwind gray-600
      });

      container.appendChild(chart.render());
      container.classList.add('graph-loaded');
      
    } catch (error) {
      console.error('Error rendering skills chart:', error);
      container.innerHTML = '<p class="text-gray-500 text-center">Failed to load skills chart</p>';
    }
  }
}
