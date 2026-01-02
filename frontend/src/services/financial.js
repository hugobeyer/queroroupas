import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const financialService = {
  // Sales
  async createSale(sale) {
    const response = await axios.post(`${API}/sales`, sale);
    return response.data;
  },

  async getSales(filters = {}) {
    const response = await axios.get(`${API}/sales`, { params: filters });
    return response.data;
  },

  async getSale(id) {
    const response = await axios.get(`${API}/sales/${id}`);
    return response.data;
  },

  // Installments
  async getInstallments(filters = {}) {
    const response = await axios.get(`${API}/installments`, { params: filters });
    return response.data;
  },

  async payInstallment(id) {
    const response = await axios.put(`${API}/installments/${id}/pay`);
    return response.data;
  },

  // Cash Flow
  async createCashFlowEntry(entry) {
    const response = await axios.post(`${API}/cash-flow`, entry);
    return response.data;
  },

  async getCashFlow(filters = {}) {
    const response = await axios.get(`${API}/cash-flow`, { params: filters });
    return response.data;
  },

  async deleteCashFlowEntry(id) {
    const response = await axios.delete(`${API}/cash-flow/${id}`);
    return response.data;
  },

  // Dashboard
  async getDashboardSummary() {
    const response = await axios.get(`${API}/dashboard/summary`);
    return response.data;
  },

  async getMonthlyReport(month, year) {
    const response = await axios.get(`${API}/reports/monthly`, {
      params: { month, year }
    });
    return response.data;
  },
};
