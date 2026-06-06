import { supabase } from './supabaseClient';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
};

const formatEndpoint = (endpoint) => {
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
};

export const apiClient = {
  async get(endpoint, params = {}) {
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = new URL(`${API_BASE_URL}${formattedEndpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const headers = await getHeaders();
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  async post(endpoint, body) {
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = `${API_BASE_URL}${formattedEndpoint}`;
    const headers = await getHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  async patch(endpoint, body, params = {}) {
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = new URL(`${API_BASE_URL}${formattedEndpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const headers = await getHeaders();
    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }
};
