// js/api.js

const BASE_URL = 'https://learn.zone01kisumu.ke/api';
const SIGNIN_URL = `${BASE_URL}/auth/signin`;
const GRAPHQL_URL = `${BASE_URL}/graphql-engine/v1/graphql`;

class API {
  constructor() {
    this.tokenKey = 'jwt_token';
  }

  // Store JWT securely
  setToken(token) {
    console.log('Storing token:', token);
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Retrieved token:', token);
    return token;
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // Get JWT from server
  async login(identifier, password) {
    const credentials = btoa(`${identifier}:${password}`);
    const res = await fetch(SIGNIN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!res.ok) {
      throw new Error('Invalid username/email or password.');
    }

    let token = await res.text();
    console.log('Server response:', token);
    
    // Remove surrounding quotes if present and clean up
    token = token.replace(/^"|"$/g, '').trim();
    
    if (!token || token === '') {
      throw new Error('Token not received from server.');
    }

    this.setToken(token);
    return token;
  }

  // GraphQL Query Executor
  async queryGraphQL(query, variables = {}) {
    const token = this.getToken();
    if (!token) throw new Error('Unauthorized');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    
    console.log('GraphQL Request:', {
      url: GRAPHQL_URL,
      headers,
      query,
      variables
    });

    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) {
      this.clearToken();
      window.location.hash = '#/login';
      throw new Error('Session expired. Please login again.');
    }

    try {
      const json = await res.json();
      console.log('Full GraphQL Response:', json);

      if (json.errors) {
        console.error('GraphQL response errors:', json.errors);
        const errorMessage = json.errors
          .map(error => {
            if (error.extensions?.code) {
              return `${error.extensions.code}: ${error.message}`;
            }
            return error.message;
          })
          .join(', ');
        throw new Error(`GraphQL query failed: ${errorMessage}`);
      }

      if (!json.data) {
        console.error('GraphQL response has no data:', json);
        throw new Error('No data returned from GraphQL API');
      }

      return json.data;
    } catch (error) {
      if (error.message.includes('JSON')) {
        console.error('Invalid JSON in response:', error);
        throw new Error('Invalid response from server');
      }
      throw error;
    }
  }
}

export const api = new API();
