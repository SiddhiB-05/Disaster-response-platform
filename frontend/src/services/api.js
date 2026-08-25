import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const incidentService = {
  submitReport: async (data) => {
    const response = await api.post('/incidents', data);
    return response.data;
  },
  getIncidents: async () => {
    const response = await api.get('/incidents');
    return response.data;
  },
  getIncidentById: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  deleteIncident: async (id) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  }
};

export const resourceService = {
  getResources: async () => {
    const response = await api.get('/resources');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/resources/${id}/status`, { status });
    return response.data;
  }
};

export const alertService = {
  getAlerts: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },
  triggerAlert: async (alertData) => {
    const response = await api.post('/alerts/trigger', alertData);
    return response.data;
  }
};

export const facilityService = {
  getFacilities: async () => {
    const response = await api.get('/facilities');
    return response.data;
  }
};

export const assignmentService = {
  assignResource: async (incident_id, resource_id) => {
    const response = await api.post('/assignments', { incident_id, resource_id });
    return response.data;
  },
  runOptimization: async () => {
    const response = await api.post('/assignments/optimize');
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  }
};

export const demoService = {
  seedData: async () => {
    const response = await api.post('/demo/seed');
    return response.data;
  },
  resetData: async () => {
    const response = await api.post('/demo/reset');
    return response.data;
  }
};

export default api;
