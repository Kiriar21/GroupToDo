import axios from 'axios';
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiInstance = axios.create({
  baseURL: baseURL,
  withCredentials: false,
});

export function setApiToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

apiInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

const api = {
  register: (nickname, password) =>
    apiInstance
      .post('/auth/register', { nickname, password })
      .then(r => r.data),

  login: (nickname, password) =>
    apiInstance
      .post('/auth/login', { nickname, password })
      .then(r => r.data),

  logout: () =>
    Promise.resolve(), 

  getSession: () =>
    apiInstance
      .get('/auth/session')
      .then(r => r.data),


  getProjectById: (projectId) =>
    apiInstance
    .get(`/projects/${projectId}`)
    .then(r => r.data),


  getProjects: () =>
    apiInstance
      .get('/projects')
      .then(r => r.data),

  getInvitations: () =>
    apiInstance
      .get('/invitations')
      .then(r => r.data),

  getTasks: projectId =>
    apiInstance
      .get(`/projects/${projectId}/tasks`)
      .then(r => r.data),

  createProject: (name, description) =>
    apiInstance
      .post('/projects', { name, description })
      .then(r => r.data),

  deleteProject: id =>
    apiInstance
      .delete(`/projects/${id}`)
      .then(r => r.data),

  createTask: (projectId, title, description, assignee) =>
    apiInstance
      .post(`/projects/${projectId}/tasks`, { title, description, assignee })
      .then(r => r.data),

  updateTask: (projectId, taskId, data) =>
    apiInstance
      .put(`/projects/${projectId}/tasks/${taskId}`, data)
      .then(r => r.data),

  deleteTask: (projectId, taskId) =>
    apiInstance
      .delete(`/projects/${projectId}/tasks/${taskId}`)
      .then(r => r.data),

  inviteUser: (projectId, nickname) =>
    apiInstance
      .post(`/projects/${projectId}/invitations`, { nickname })
      .then(r => r.data),

  acceptInvitation: invId =>
    apiInstance
      .put(`/invitations/${invId}/accept`)
      .then(r => r.data),

  declineInvitation: invId =>
    apiInstance
      .put(`/invitations/${invId}/decline`)
      .then(r => r.data),
};

export default api;
