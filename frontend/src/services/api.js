import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  getIncidents: async (filters = {}) => {
    const response = await api.get('/incidents', { params: filters });
    return response.data;
  },
  getIncidentById: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },
  recalculatePriority: async (id) => {
    const response = await api.post(`/incidents/${id}/recalculate`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/incidents/${id}/status`, { status });
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
    const response = await api.patch(`/resources/${id}/status`, { status });
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
  },
  resolveAlert: async (id) => {
    const response = await api.post(`/alerts/${id}/resolve`);
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
  runOptimization: async () => {
    const response = await api.post('/assignments/optimize');
    return response.data;
  },
  confirmAssignment: async (incident_id, resource_id, reason) => {
    const response = await api.post('/assignments/confirm', { incident_id, resource_id, reason });
    return response.data;
  },
  assignResource: async (incident_id, resource_id, reason) => {
    const response = await api.post('/assignments/confirm', { incident_id, resource_id, reason });
    return response.data;
  },

  updateStatus: async (assignment_id, status) => {
    const response = await api.patch(`/assignments/${assignment_id}/status`, { status });
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  }
};

export const auditService = {
  getAuditEvents: async (limit = 50) => {
    const response = await api.get('/audit', { params: { limit } });
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

export const extraService = {
  getWeatherTelemetry: async () => {
    const response = await api.get('/weather/telemetry');
    return response.data;
  },
  getChatbotGuidance: async (data) => {
    const response = await api.post('/chatbot/message', data);
    return response.data;
  },
  getEmergencyContacts: async () => {
    const response = await api.get('/emergency/contacts');
    return response.data;
  }
};


export function setupWebSocket(onEvent) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//localhost:8000/api/v1/ws`;
  
  let ws = null;
  let reconnectTimer = null;

  function connect() {
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onEvent) onEvent(parsed);
        } catch (e) {
          console.warn("WebSocket message parse error:", e);
        }
      };
      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = (err) => {
        ws.close();
      };
    } catch (e) {
      reconnectTimer = setTimeout(connect, 3000);
    }
  }

  connect();

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}

export default api;
