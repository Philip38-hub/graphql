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
    transaction(where: { type: { _eq: "xp" } }) {
      id
      type
      amount
      objectId
      createdAt
      path
    }
  }`,

  AUDIT_RESULTS: `{
    result(where: { type: { _eq: "audit" } }) {
      id
      grade
      type
      createdAt
      path
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
      transactions: [],
      results: [],
      objects: []
    };
  }

  async fetchAllData() {
    try {
      // Fetch user data
      try {
        console.log('Fetching user data...');
        const userData = await api.queryGraphQL(QUERIES.USER_DATA);
        console.log('User data received:', userData);
        
        if (!userData?.user?.[0]) {
          throw new Error('User data not found in response');
        }
        this.data.user = userData.user[0];
        console.log('User data processed:', this.data.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        this.data.user = null;
      }
      
      // Fetch XP transactions
      try {
        console.log('Fetching XP transactions...');
        const txData = await api.queryGraphQL(QUERIES.XP_TRANSACTIONS);
        console.log('Transaction data received:', txData);
        if (txData?.transaction) {
          this.data.transactions = txData.transaction.filter(tx => tx.amount > 0);
        }
        console.log('Transaction data processed:', this.data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        this.data.transactions = [];
      }
      
      // Fetch audit results
      try {
        console.log('Fetching audit results...');
        const resultData = await api.queryGraphQL(QUERIES.AUDIT_RESULTS);
        console.log('Audit data received:', resultData);
        if (resultData?.result) {
          this.data.results = resultData.result;
        }
        console.log('Audit data processed:', this.data.results);
      } catch (error) {
        console.error('Failed to fetch audit results:', error);
        this.data.results = [];
      }
      
      // Fetch object names if we have transactions
      if (this.data.transactions.length > 0) {
        const objectIds = [...new Set(this.data.transactions
          .map(tx => tx.objectId)
          .filter(id => id)
          .map(id => parseInt(id))
        )];
        
        if (objectIds.length > 0) {
          console.log('Fetching object names for IDs:', objectIds);
          try {
            const objectData = await api.queryGraphQL(QUERIES.OBJECT_NAMES, { ids: objectIds });
            console.log('Object data received:', objectData);
            if (objectData?.object) {
              this.data.objects = objectData.object;
            }
          } catch (error) {
            console.error('Failed to fetch object names:', error);
          }
        }
      }

      console.log('Final processed profile data:', this.data);
      return this.data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      if (error.message.includes('JWT')) {
        throw new Error('Authentication error. Please try logging in again.');
      }
      throw error;
    }
  }

  getUserData() {
    return this.data.user;
  }

  getStats() {
    try {
      // Calculate total XP
      const totalXP = this.data.transactions.reduce((sum, tx) => {
        return sum + (Number(tx.amount) || 0);
      }, 0);

      // Calculate audit ratio from results
      let auditRatio = 'N/A';
      const auditResults = this.data.results.filter(r => r.type === 'audit' && r.grade !== null);
      
      if (auditResults.length > 0) {
        const passCount = auditResults.filter(r => r.grade === 1).length;
        const total = auditResults.length;
        auditRatio = `${Math.round((passCount / total) * 100)}%`;
      }

      console.log('Calculated stats:', { totalXP, auditRatio });
      return { totalXP, auditRatio };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return { totalXP: 0, auditRatio: 'N/A' };
    }
  }

  getXPData() {
    try {
      if (!this.data.transactions || this.data.transactions.length === 0) {
        return [];
      }

      // Group XP by project path
      const xpByProject = {};
      this.data.transactions.forEach(tx => {
        if (tx.path) {
          const projectName = tx.path.split('/').pop() || tx.path;
          xpByProject[projectName] = (xpByProject[projectName] || 0) + Number(tx.amount);
        }
      });

      // Convert to array format for graph
      const data = Object.entries(xpByProject)
        .map(([project, xp]) => ({
          label: project,
          value: xp
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Show top 10 projects

      console.log('XP data for graph:', data);
      return data;
    } catch (error) {
      console.error('Error processing XP data:', error);
      return [];
    }
  }

  getAuditData() {
    try {
      const auditResults = this.data.results.filter(r => 
        r.type === 'audit' && r.grade !== null
      );
      
      console.log('Processing audit results:', auditResults);

      if (auditResults.length === 0) {
        return [
          { label: 'Pass', value: 0 },
          { label: 'Fail', value: 0 }
        ];
      }

      const passCount = auditResults.filter(r => r.grade === 1).length;
      const failCount = auditResults.filter(r => r.grade === 0).length;

      const data = [
        { label: 'Pass', value: passCount },
        { label: 'Fail', value: failCount }
      ];

      console.log('Calculated audit data:', data);
      return data;
    } catch (error) {
      console.error('Error calculating audit data:', error);
      return [
        { label: 'Pass', value: 0 },
        { label: 'Fail', value: 0 }
      ];
    }
  }
}

export const profileData = new ProfileDataManager();