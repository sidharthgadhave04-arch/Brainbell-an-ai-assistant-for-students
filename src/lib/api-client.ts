const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3003/api';

export const apiClient = {
  async getCuratedResources(userId: string) {
    const url = `${API_BASE_URL}/curate-resources?userId=${userId}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    return response.json();
  },

  async createCuratedResources(userId: string, subject: string) {
    const response = await fetch(`${API_BASE_URL}/curate-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, subject }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error === 'RESOURCE_EXISTS') {
        return data;
      }
      throw {
        status: response.status,
        error: data.error,
        message: data.message,
        response: { data }
      };
    }
    
    return data;
  },

  async getStudyPlan(userId: string) {
    const response = await fetch(`${API_BASE_URL}/study-plan?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch study plan');
    }
    return response.json();
  },

  async createStudyPlan(userId: string, subject: string, examDate: string) {
    const response = await fetch(`${API_BASE_URL}/study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, subject, examDate }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error === 'PLAN_EXISTS') {
        return data;
      }
      throw {
        status: response.status,
        error: data.error,
        message: data.message,
        response: { data }
      };
    }
    
    return data;
  },

  async deleteStudyPlan(planId: string) {
    const response = await fetch(`${API_BASE_URL}/study-plan/${planId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        error: data.error,
        message: data.message || 'Failed to delete plan',
        response: { data }
      };
    }
    
    return data;
  },

  async deleteCuratedResources(resourceId: string) {
    const response = await fetch(`${API_BASE_URL}/curate-resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete resources');
    }
    return response.json();
  }
};