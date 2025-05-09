// js/queries.js
import { api } from './api.js';

// GraphQL Queries
const QUERIES = {
  USER_DATA: `{
    user {
      id
      login
    }
  }`,

  XP_TRANSACTIONS: `{
    transaction(where: { type: { _eq: "xp" }}) {
      amount
      objectId
    }
  }`,

  AUDIT_RESULTS: `{
    result {
      grade
    }
  }`,

  OBJECT_NAMES: `query getObjects($ids: [Int!]) {
    object(where: { id: { _in: $ids }}) {
      id
      name
    }
  }`
};

class ProfileDataManager {
  constructor() {
    this.data = {
      user: null,
      transactions: null,
      results: null,
      objects: null
    };
  }

  // Fetch all profile data at once
  async fetchAllData() {
    try {
      // Fetch user data and XP/audit data in parallel
      const [userData, txData, resultData] = await Promise.all([
        api.queryGraphQL(QUERIES.USER_DATA),
        api.queryGraphQL(QUERIES.XP_TRANSACTIONS),
        api.queryGraphQL(QUERIES.AUDIT_RESULTS)
      ]);

      this.data.user = userData.user[0];
      this.data.transactions = txData.transaction;
      this.data.results = resultData.result;

      // Get object IDs from transactions
      const objectIds = [...new Set(this.data.transactions.map(tx => parseInt(tx.objectId)))];
      
      if (objectIds.length > 0) {
        const objectData = await api.queryGraphQL(QUERIES.OBJECT_NAMES, { ids: objectIds });
        this.data.objects = objectData.object;
      }

      return this.data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  }

  // Data access methods
  getUserData() {
    return this.data.user;
  }

  getStats() {
    if (!this.data.transactions || !this.data.results) return null;

    const totalXP = this.data.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const grades = this.data.results.map(r => r.grade);
    const passCount = grades.filter(g => g === 1).length;
    const failCount = grades.filter(g => g === 0).length;
    const auditRatio = failCount === 0 ? '100%' : 
      `${Math.round((passCount / (passCount + failCount)) * 100)}%`;

    return { totalXP, auditRatio };
  }

  getXPData() {
    if (!this.data.transactions || !this.data.objects) return null;

    // Group XP by objectId
    const xpMap = {};
    this.data.transactions.forEach(({ amount, objectId }) => {
      if (!xpMap[objectId]) xpMap[objectId] = 0;
      xpMap[objectId] += amount;
    });

    // Create object name map
    const objectMap = this.data.objects.reduce((map, obj) => {
      map[obj.id] = obj.name || `#${obj.id}`;
      return map;
    }, {});

    // Format data for graph
    return Object.entries(xpMap).map(([objectId, xp]) => ({
      label: (objectMap[objectId] || `#${objectId}`).slice(0, 8),
      value: xp
    }));
  }

  getAuditData() {
    if (!this.data.results) return null;

    const grades = this.data.results.map(r => r.grade);
    const passCount = grades.filter(g => g === 1).length;
    const failCount = grades.filter(g => g === 0).length;

    return [
      { label: 'Pass', value: passCount },
      { label: 'Fail', value: failCount }
    ];
  }
}

export const profileData = new ProfileDataManager();