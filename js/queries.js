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

  SKILLS_DATA: `query getSkillsData($userId: Int!) {
    # Normal query - get progress data
    progress {
      id
      grade
      path
      createdAt
      
      # Nested query - get related object data
      object {
        id
        name
        type
      }
    }
    
    # Query with arguments - get user's specific results
    result(where: {userId: {_eq: $userId}}) {
      id
      grade
      path
      type
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
      objects: [],
      progress: []
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
        // .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Show top 10 projects

      console.log('XP data for graph:', data);
      return data;
    } catch (error) {
      console.error('Error processing XP data:', error);
      return [];
    }
  }

  async getSkillsData() {
    console.log('getSkillsData called');
    try {
      if (!this.data.user) {
        console.warn('No user data available for skills calculation');
        return [];
      }

      // First check if we have progress data
      if (this.data.progress && this.data.progress.length > 0) {
        console.log('Using existing progress data for skills');
        return this.calculateSkillsFromProgress();
      }

      // If we don't have progress data yet, fetch it
      console.log('No progress data yet, fetching it now');
      return await this.fetchSkillsData();
    } catch (error) {
      console.error('Error getting skills data:', error);
      return [];
    }
  }

  async fetchSkillsData() {
    try {
      console.log('Fetching skills data...');
      const userId = this.data.user.id;
      
      // Fetch skills data using our new query with the user's ID as a variable
      const skillsData = await api.queryGraphQL(QUERIES.SKILLS_DATA, { userId });
      console.log('Skills data received:', skillsData);
      
      // Store progress data for future use
      if (skillsData?.progress) {
        this.data.progress = skillsData.progress;
      }
      
      // Store additional results if not already present
      if (skillsData?.result && (!this.data.results || this.data.results.length === 0)) {
        this.data.results = skillsData.result;
      }
      
      return this.calculateSkillsFromProgress();
    } catch (error) {
      console.error('Failed to fetch skills data:', error);
      // Fall back to sample data if we can't get real data
      return this.getSampleSkillsData();
    }
  }

  calculateSkillsFromProgress() {
    if (!this.data.progress || this.data.progress.length === 0) {
      console.log('No progress data available, using sample data');
      // return this.getSampleSkillsData();
    }
    
    console.log('Calculating skills from progress data');
    
    // Define core skill categories
    const skillsMap = {
      'Programming': { count: 0, totalGrade: 0, completed: 0 },
      'Frontend': { count: 0, totalGrade: 0, completed: 0 },
      'Backend': { count: 0, totalGrade: 0, completed: 0 },
      'UX/UI': { count: 0, totalGrade: 0, completed: 0 },
      'Git': { count: 0, totalGrade: 0, completed: 0 },
      'Go': { count: 0, totalGrade: 0, completed: 0 },
      'JavaScript': { count: 0, totalGrade: 0, completed: 0 }
    };
    
    // Define keywords that map to each core skill
    const skillKeywords = {
      'Programming': ['algorithm', 'data-structure', 'logic', 'programming', 'coding', 'piscine'],
      'Frontend': ['html', 'css', 'react', 'vue', 'angular', 'dom', 'frontend', 'ui', 'responsive'],
      'Backend': ['api', 'server', 'database', 'sql', 'nosql', 'backend', 'rest', 'graphql', 'node'],
      'UX/UI': ['design', 'ux', 'ui', 'user-experience', 'user-interface', 'accessibility'],
      'Git': ['git', 'github', 'version-control', 'repository'],
      'Go': ['go', 'golang'],
      'JavaScript': ['js', 'javascript', 'typescript', 'es6']
    };
    
    // Process progress data to categorize into core skills
    this.data.progress.forEach(item => {
      if (!item.path) return;
      
      // Extract path components
      const pathLower = item.path.toLowerCase();
      const pathParts = pathLower.split('/').filter(Boolean);
      
      // Check which core skills this item belongs to
      let matchedSkills = [];
      
      // Check path against skill keywords
      for (const [skill, keywords] of Object.entries(skillKeywords)) {
        if (keywords.some(keyword => pathLower.includes(keyword))) {
          matchedSkills.push(skill);
        }
      }
      
      // If no specific matches, categorize as general Programming
      if (matchedSkills.length === 0) {
        matchedSkills.push('Programming');
      }
      
      // Update stats for each matched skill
      matchedSkills.forEach(skill => {
        skillsMap[skill].count++;
        if (item.grade !== null && item.grade !== undefined) {
          skillsMap[skill].totalGrade += item.grade;
          skillsMap[skill].completed++;
        }
      });
    });
    
    // Calculate skill proficiency (as a percentage)
    const skills = Object.entries(skillsMap)
      .filter(([_, stats]) => stats.count > 0)
      .map(([skill, stats]) => {
        // Calculate proficiency based on grades and completion
        const completionRate = stats.completed / stats.count;
        const avgGrade = stats.completed > 0 ? stats.totalGrade / stats.completed : 0;
        
        // Combine factors for overall skill value (0-100)
        const value = Math.round((avgGrade * 0.7 + completionRate * 0.3) * 100);
        
        return {
          label: skill,
          value: Math.min(value, 100) // Cap at 100
        };
      })
      .sort((a, b) => b.value - a.value);
    
    console.log('Calculated core skills:', skills);
    
    // If we don't have enough skills with data, add placeholder skills
    if (skills.length < 3) {
      console.log('Not enough skills data, adding placeholders');
      const coreSkills = ['Programming', 'Frontend', 'Backend', 'UX/UI', 'Git', 'Go', 'JavaScript'];
      
      // Add missing core skills with default values
      coreSkills.forEach(skill => {
        if (!skills.some(s => s.label === skill)) {
          skills.push({
            label: skill,
            value: 50 // Default middle value
          });
        }
      });
      
      // Take top 6 skills
      return skills.slice(0, 6);
    }
    
    // Return top 6 skills
    return skills.slice(0, 6);
  }

  formatSkillName(name) {
    // Format common skill names
    const skillNameMap = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'go': 'Go',
      'golang': 'Go',
      'react': 'React',
      'html': 'HTML/CSS',
      'css': 'HTML/CSS',
      'node': 'Node.js',
      'graphql': 'GraphQL',
      'sql': 'SQL',
      'python': 'Python',
      'django': 'Django',
      'vue': 'Vue.js',
      'angular': 'Angular'
    };
    
    // Check for direct mapping
    if (skillNameMap[name.toLowerCase()]) {
      return skillNameMap[name.toLowerCase()];
    }
    
    // Otherwise capitalize first letter of each word
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getXPProgressData() {
    try {
      if (!this.data.transactions || this.data.transactions.length === 0) {
        return [];
      }

      // Sort transactions by date
      const sortedTransactions = [...this.data.transactions]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Group XP by date (day)
      const xpByDate = {};
      let cumulativeXP = 0;

      sortedTransactions.forEach(tx => {
        if (!tx.createdAt) return;

        // Format date as YYYY-MM-DD to group by day
        const date = new Date(tx.createdAt);
        const dateKey = date.toISOString().split('T')[0];

        // Add XP to the date
        if (!xpByDate[dateKey]) {
          xpByDate[dateKey] = {
            date: dateKey,
            value: 0,
            dailyXP: 0
          };
        }

        xpByDate[dateKey].dailyXP += Number(tx.amount);
      });

      // Convert to array and calculate cumulative XP
      const dateKeys = Object.keys(xpByDate).sort();
      const progressData = [];

      dateKeys.forEach(dateKey => {
        cumulativeXP += xpByDate[dateKey].dailyXP;
        progressData.push({
          date: dateKey,
          value: cumulativeXP,
          dailyXP: xpByDate[dateKey].dailyXP
        });
      });

      // If we have too many data points, reduce them to a reasonable number
      let finalData = progressData;
      if (progressData.length > 20) {
        // Sample data points to reduce the number
        const step = Math.ceil(progressData.length / 20);
        finalData = progressData.filter((_, index) => index % step === 0 || index === progressData.length - 1);
      }

      console.log('XP progress data for graph:', finalData);
      return finalData;
    } catch (error) {
      console.error('Error processing XP progress data:', error);
      return [];
    }
  }
}

export const profileData = new ProfileDataManager();
