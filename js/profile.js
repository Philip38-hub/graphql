// js/profile.js
import { api } from './api.js';
import { BarGraph, PieChart } from './graph.js';

export class ProfilePage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'profile-page';
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<h2>Your Profile</h2><p>Loading...</p>`;
    this.container.appendChild(wrapper);

    try {
      const userData = await this.fetchUserData();
      const statsData = await this.fetchStats();

      wrapper.innerHTML = `
        <h2>Welcome, ${userData.login}</h2>
        <div><strong>User ID:</strong> ${userData.id}</div>
        <div><strong>Total XP:</strong> ${statsData.totalXP}</div>
        <div><strong>Audit Pass Ratio:</strong> ${statsData.auditRatio}</div>
        <hr />
        <h3>Graphs</h3>
        <div id="graph-area">
          <!-- Graphs will be rendered here -->
        </div>
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

    return this.container;
  }

  async fetchUserData() {
    const query = `
      {
        user {
          id
          login
        }
      }
    `;
    const data = await api.queryGraphQL(query);
    return data.user[0];
  }

  async fetchStats() {
    const xpQuery = `
      {
        transaction(where: { type: { _eq: "xp" }}) {
          amount
        }
      }
    `;

    const resultQuery = `
      {
        result {
          grade
        }
      }
    `;

    const xpData = await api.queryGraphQL(xpQuery);
    const resultData = await api.queryGraphQL(resultQuery);

    const totalXP = xpData.transaction.reduce((sum, tx) => sum + tx.amount, 0);
    const grades = resultData.result.map(r => r.grade);
    const passCount = grades.filter(g => g === 1).length;
    const failCount = grades.filter(g => g === 0).length;
    const auditRatio = failCount === 0 ? '100%' : `${Math.round((passCount / (passCount + failCount)) * 100)}%`;

    return { totalXP, auditRatio };
  }
}
