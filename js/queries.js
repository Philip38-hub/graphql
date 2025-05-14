// js/queries.js
import { api } from './api.js';

// GraphQL Queries
const QUERIES = {
  // Separate queries that will be executed in sequence
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
      userId
      createdAt
      path
      object {
        id
        name
        type
      }
    }
  }`,

  AUDIT_RESULTS: `{
    result(where: { type: { _eq: "audit" } }) {
      id
      grade
      type
      objectId
      userId
      createdAt
      path
      object {
        id
        name
        type
      }
    }
  }`,

  // Keep this as a separate query for specific object lookups if needed
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
      
      // Fetch XP transactions with nested object data
      try {
        console.log('Fetching XP transactions with objects...');
        const txData = await api.queryGraphQL(QUERIES.XP_TRANSACTIONS);
        console.log('Transaction data received:', txData);
        
        if (txData?.transaction) {
          // Filter to current user's transactions and positive amounts
          this.data.transactions = txData.transaction
            .filter(tx => tx.userId === this.data.user?.id && tx.amount > 0);
            
          // Extract objects from transactions
          const objects = txData.transaction
            .filter(tx => tx.object && tx.userId === this.data.user?.id)
            .map(tx => tx.object);
            
          this.data.objects = [...objects];
        }
        console.log('Transaction data processed:', this.data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        this.data.transactions = [];
      }
      
      // Fetch audit results with nested object data
      try {
        console.log('Fetching audit results with objects...');
        const resultData = await api.queryGraphQL(QUERIES.AUDIT_RESULTS);
        console.log('Audit data received:', resultData);
        
        if (resultData?.result) {
          // Filter to current user's results
          this.data.results = resultData.result
            .filter(result => result.userId === this.data.user?.id);
            
          // Extract objects from results that weren't already in our objects collection
          const existingObjectIds = new Set(this.data.objects.map(obj => obj.id));
          const resultObjects = resultData.result
            .filter(result => result.object && result.userId === this.data.user?.id)
            .map(result => result.object)
            .filter(obj => !existingObjectIds.has(obj.id));
            
          this.data.objects = [...this.data.objects, ...resultObjects];
        }
        console.log('Audit data processed:', this.data.results);
      } catch (error) {
        console.error('Failed to fetch audit results:', error);
        this.data.results = [];
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