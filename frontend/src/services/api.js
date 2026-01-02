import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// Axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(email, password, name) {
    const response = await axios.post(`${API}/auth/register`, {
      email,
      password,
      name,
      role: 'customer',
    });
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  },

  async login(email, password) {
    const response = await axios.post(`${API}/auth/login`, {
      email,
      password,
    });
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  },

  async getMe() {
    const response = await axios.get(`${API}/auth/me`);
    return response.data;
  },

  logout() {
    removeToken();
    removeUser();
  },

  getToken,
  getUser,
  isAuthenticated: () => !!getToken(),
  isAdmin: () => {
    const user = getUser();
    return user && user.role === 'admin';
  },
};

export const productService = {
  async getAll() {
    const response = await axios.get(`${API}/products`);
    return response.data;
  },

  async create(product) {
    const response = await axios.post(`${API}/products`, product);
    return response.data;
  },

  async update(id, product) {
    const response = await axios.put(`${API}/products/${id}`, product);
    return response.data;
  },

  async delete(id) {
    const response = await axios.delete(`${API}/products/${id}`);
    return response.data;
  },
};

export const uploadService = {
  async uploadImage(file) {
    console.log('[uploadService] Starting upload:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('[uploadService] FormData created, sending to:', `${API}/upload`);
    
    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[uploadService] Upload response:', response.data);
      
      // Return full URL with backend URL
      const uploadPath = response.data.url;
      const fullUrl = uploadPath.startsWith('http') ? uploadPath : `${BACKEND_URL}${uploadPath}`;
      
      console.log('[uploadService] Full URL:', fullUrl);
      
      return fullUrl;
    } catch (error) {
      console.error('[uploadService] Upload error:', error);
      console.error('[uploadService] Error response:', error.response?.data);
      throw error;
    }
  },
};

export const settingsService = {
  async get() {
    const response = await axios.get(`${API}/settings`);
    return response.data;
  },

  async update(settings) {
    const response = await axios.put(`${API}/settings`, settings);
    return response.data;
  },
};

export const newsletterService = {
  // Subscribers
  async subscribe(email) {
    const response = await axios.post(`${API}/subscribers`, { email });
    return response.data;
  },

  async getSubscribers() {
    const response = await axios.get(`${API}/subscribers`);
    return response.data;
  },

  async unsubscribe(id) {
    const response = await axios.delete(`${API}/subscribers/${id}`);
    return response.data;
  },

  // Campaigns
  async getCampaigns() {
    const response = await axios.get(`${API}/campaigns`);
    return response.data;
  },

  async createCampaign(campaign) {
    const response = await axios.post(`${API}/campaigns`, campaign);
    return response.data;
  },

  async updateCampaign(id, campaign) {
    const response = await axios.put(`${API}/campaigns/${id}`, campaign);
    return response.data;
  },

  async deleteCampaign(id) {
    const response = await axios.delete(`${API}/campaigns/${id}`);
    return response.data;
  },

  async sendCampaign(id) {
    const response = await axios.post(`${API}/campaigns/${id}/send`);
    return response.data;
  },

  async previewCampaign(id) {
    const response = await axios.get(`${API}/campaigns/${id}/preview`);
    return response.data;
  },
};