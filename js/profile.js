// js/profile.js
import { api } from './api.js';
import { BarGraph, PieChart } from './graph.js';

export class ProfilePage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'profile-page';
  }

  async render() {
    const token = api.getToken();
    if (!token) {
      window.location.hash = '#/login';
      return document.createElement('div');
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<h2>Your Profile</h2><p>Loading...</p>`;
    this.container.appendChild(wrapper);

    try {
      // Fetch all data at once
      await profileData.fetchAllData();
      const userData = profileData.getUserData();
      const statsData = profileData.getStats();

      wrapper.innerHTML = `
        <h2>Welcome, ${userData.login}</h2>
        <div class="profile-info-cards">
          <div class="profile-card active">
            <h3>User ID</h3>
            <p>${userData.id}</p>
          </div>
          <div class="profile-card">
            <h3>Total XP</h3>
            <p>${statsData.totalXP}</p>
          </div>
          <div class="profile-card">
            <h3>Audit Pass Ratio</h3>
            <p>${statsData.auditRatio}</p>
          </div>
        </div>
        <h3>Graphs</h3>
        <div id="graph-xp"></div>
        <div id="graph-passfail"></div>
        <button id="logout-btn">Logout</button>
      `;

      wrapper.querySelector('#logout-btn').addEventListener('click', () => {
        api.clearToken();
        window.location.hash = '#/login';
        
        // // render graphs in graph area
        // const graph = new BarGraph([...], { title: 'XP', barColor: '#007bff' });
        // document.getElementById('graph-area').appendChild(graph.render());

        // const pie = new PieChart([...], { colors: ['green', 'red'] });
        // document.getElementById('graph-area').appendChild(pie.render());

      });

    } catch (err) {
      wrapper.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }

    // Focus effect on scroll
    const cardContainer = wrapper.querySelector('.profile-info-cards');
    if (cardContainer) {
      cardContainer.addEventListener('scroll', () => {
        const cards = cardContainer.querySelectorAll('.profile-card');
        const midX = cardContainer.scrollLeft + cardContainer.offsetWidth / 2;

        cards.forEach(card => {
          const cardMid = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardMid - midX);
          card.classList.toggle('active', dist < card.offsetWidth / 2);
        });
      });

      // Trigger initial state
      cardContainer.dispatchEvent(new Event('scroll'));
    }

    // Render XP graph
    const xpDiv = wrapper.querySelector('#graph-xp');
    this.renderXPGraph(xpDiv); // Load XP per project graph

    // Load pass/fail chart
    const passFailDiv = wrapper.querySelector('#graph-passfail');
    this.renderPassFailChart(passFailDiv);

    return this.container;
  }

  async renderPassFailChart(container) {
    const chartData = profileData.getAuditData();
    
    if (!chartData || chartData[0].value + chartData[1].value === 0) {
      container.innerHTML = `<p>No audit data available.</p>`;
      return;
    }
  
    const pie = new PieChart(chartData, {
      width: 250,
      height: 250,
      colors: ['#4CAF50', '#F44336'],
    });
  
    container.appendChild(pie.render());
  }

  async renderXPGraph(container) {
    const graphData = profileData.getXPData();
    
    if (!graphData || graphData.length === 0) {
      container.innerHTML = `<p>No XP data available.</p>`;
      return;
    }
  
    const graph = new BarGraph(graphData, {
      width: 500,
      height: 300,
      barColor: '#3366cc',
    });
  
    container.appendChild(graph.render());
  }

}
