// API Configuration for MERN Backend
const API_BASE_URL = "http://localhost:3001";

// Get auth token from localStorage
function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

// Helper function for API requests
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// Auth Endpoints
export const authAPI = {
  login: (email, password) =>
    fetchAPI("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (data) =>
    fetchAPI("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => fetchAPI("/api/auth/profile"),
  updateProfile: (data) =>
    fetchAPI("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
};

// RFP Endpoints
export const rfpAPI = {
  getAll: () => fetchAPI("/api/rfps"),
  getById: (id) => fetchAPI(`/api/rfps/${id}`),
  create: (data) => fetchAPI("/api/rfps", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/api/rfps/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/api/rfps/${id}`, { method: "DELETE" }),
};

// Agent Endpoints
export const agentAPI = {
  getStatus: () => fetchAPI("/api/agents/status"),
  getSalesAgent: () => fetchAPI("/api/agents/sales"),
  getTechnicalAgent: () => fetchAPI("/api/agents/technical"),
  getPricingAgent: () => fetchAPI("/api/agents/pricing"),
};

// Workflow Endpoints
export const workflowAPI = {
  start: (rfpId) => fetchAPI("/api/workflow/start", { method: "POST", body: JSON.stringify({ rfpId }) }),
  getStatus: (workflowId) => fetchAPI(`/api/workflow/status/${workflowId}`),
  getHistory: () => fetchAPI("/api/workflow/history"),
  cancel: (workflowId) => fetchAPI(`/api/workflow/cancel/${workflowId}`, { method: "POST" }),
};

// Products Endpoints
export const productAPI = {
  getAll: () => fetchAPI("/api/products"),
  getById: (id) => fetchAPI(`/api/products/${id}`),
  search: (query) => fetchAPI(`/api/products/search?q=${encodeURIComponent(query)}`),
  create: (data) => fetchAPI("/api/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/api/products/${id}`, { method: "DELETE" }),
  getMyProducts: () => fetchAPI("/api/products/my-products"),
};

// Pricing Endpoints
export const pricingAPI = {
  getAll: () => fetchAPI("/api/pricing"),
  update: (id, data) => fetchAPI(`/api/pricing/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Settings Endpoints
export const settingsAPI = {
  get: () => fetchAPI("/api/settings"),
  update: (data) => fetchAPI("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
  getWebUrls: () => fetchAPI("/api/settings/web-urls"),
  updateWebUrls: (urls) => fetchAPI("/api/settings/web-urls", { method: "PUT", body: JSON.stringify({ urls }) }),
};

export default {
  auth: authAPI,
  rfp: rfpAPI,
  agent: agentAPI,
  workflow: workflowAPI,
  product: productAPI,
  pricing: pricingAPI,
  settings: settingsAPI,
};
