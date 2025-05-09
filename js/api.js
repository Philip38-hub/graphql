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
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
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

    const { token } = await res.json();
    if (!token) {
      throw new Error('Token not received from server.');
    }

    this.setToken(token);
    return token;
  }

  // GraphQL Query Executor
  async queryGraphQL(query, variables = {}) {
    const token = this.getToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) {
      this.clearToken();
      window.location.hash = '#/login';
      throw new Error('Session expired. Please login again.');
    }

    const json = await res.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error('GraphQL query failed');
    }

    return json.data;
  }
}

export const api = new API();
