// js/profile.js
import { api } from './api.js';
import { BarGraph, LineGraph, WebChart } from './graph.js';
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
        <header class="profile-header bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="profile-avatar w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
              <svg viewBox="0 0 24 24" fill="white" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div class="profile-welcome text-center sm:text-left flex-1">
              <h2 class="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Welcome${userData ? `, ${userData.login}` : ''}!</h2>
              <p class="text-sm sm:text-base text-gray-500">Your GraphQL Profile Dashboard</p>
            </div>
            <button id="logout-btn" class="mt-4 sm:mt-0 p-3 rounded-full bg-red-100 hover:bg-red-200 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200" aria-label="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z" clip-rule="evenodd" />
              </svg>
            </button>
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
          <section class="profile-graphs grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div class="graph-container bg-white rounded-xl shadow-sm p-4 md:p-6 transition-all duration-300 hover:shadow-md">
              <h3 class="text-lg md:text-xl font-semibold text-gray-700 mb-2 md:mb-4">XP Distribution</h3>
              <div id="graph-xp" class="w-full h-[250px] sm:h-[300px]"></div>
            </div>
            <div class="graph-container bg-white rounded-xl shadow-sm p-4 md:p-6 transition-all duration-300 hover:shadow-md">
              <h3 class="text-lg md:text-xl font-semibold text-gray-700 mb-2 md:mb-4">XP Progress</h3>
              <div id="graph-progress" class="w-full h-[250px] sm:h-[300px]"></div>
            </div>
          </section>

          <h3 class="text-2xl font-semibold text-gray-800 mb-4 mt-6 md:mt-8">Skills Overview</h3>
          <section class="bg-white rounded-xl shadow-sm p-4 md:p-6 transition-all duration-300 hover:shadow-md">
            <div id="skills-chart" class="w-full h-[300px] sm:h-[350px] flex justify-center items-center"></div>
          </section>
        </main>

        <footer class="profile-footer mt-12">
          <p class="text-center text-gray-500 text-sm">
            &copy; ${new Date().getFullYear()} ZONE01 GraphQL Profile Dashboard
          </p>
        </footer>
      `;

      // Add interactivity after content is in DOM
      this.setupInteractivity();

      // Render graphs
      await Promise.all([
        this.renderXPGraph(),
        this.renderXPProgressChart(),
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
        container.innerHTML = '<p class="text-gray-500 text-center">No XP data available</p>';
        return;
      }

      // Clear container
      container.innerHTML = '';
      
      // Create a responsive wrapper div with Tailwind classes
      const wrapper = document.createElement('div');
      wrapper.className = 'w-full h-full min-h-[250px] sm:min-h-[300px]';
      container.appendChild(wrapper);

      const graph = new BarGraph(data, {
        width: 500,
        height: 300,
        barColor: '#3498db'
      });

      wrapper.appendChild(graph.render());
      
      // Make the graph responsive
      graph.makeResponsive(wrapper);
      
    } catch (error) {
      console.error('Error rendering XP graph:', error);
      container.innerHTML = '<p class="text-gray-500 text-center">Failed to load XP graph</p>';
    }
  }

  async renderXPProgressChart() {
    const container = this.content.querySelector('#graph-progress');
    if (!container) return;

    try {
      const data = profileData.getXPProgressData();
      console.log('Rendering XP progress chart with data:', data);

      if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No XP progress data available</p>';
        return;
      }

      // Clear container
      container.innerHTML = '';
      
      // Create a responsive wrapper div with Tailwind classes
      const wrapper = document.createElement('div');
      wrapper.className = 'w-full h-full min-h-[250px] sm:min-h-[300px]';
      container.appendChild(wrapper);

      const lineGraph = new LineGraph(data, {
        width: 500,
        height: 300,
        lineColor: '#3498db',
        areaColor: 'rgba(52, 152, 219, 0.2)',
        pointColor: '#2980b9'
      });

      wrapper.appendChild(lineGraph.render());
      
      // Make the graph responsive
      lineGraph.makeResponsive(wrapper);
      
    } catch (error) {
      console.error('Error rendering XP progress chart:', error);
      container.innerHTML = '<p class="text-gray-500 text-center">Failed to load XP progress chart</p>';
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
      
      // Create a responsive wrapper div with Tailwind classes
      const wrapper = document.createElement('div');
      wrapper.className = 'w-full h-full min-h-[300px] sm:min-h-[350px] flex justify-center items-center';
      container.appendChild(wrapper);

      const chart = new WebChart(data, {
        width: 350,
        height: 350,
        maxValue: 100,
        levels: 5,
        color: '#6366f1', // Tailwind indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Tailwind indigo-500 with opacity
        labelColor: '#4b5563' // Tailwind gray-600
      });

      wrapper.appendChild(chart.render());
      
      // Make the chart responsive
      chart.makeResponsive(wrapper);
      
      container.classList.add('graph-loaded');
      
    } catch (error) {
      console.error('Error rendering skills chart:', error);
      container.innerHTML = '<p class="text-gray-500 text-center">Failed to load skills chart</p>';
    }
  }
}
