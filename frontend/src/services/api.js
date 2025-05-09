import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

apiInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default {
  register: (nickname, password) =>
    apiInstance.post('/auth/register', { nickname, password }).then(r => r.data),
  login: (nickname, password) =>
    apiInstance.post('/auth/login', { nickname, password }).then(r => r.data),
  logout: () =>
    apiInstance.post('/auth/logout').then(r => r.data),
  getSession: () =>
    apiInstance.get('/auth/session').then(r => r.data),

  getProjects: () =>
    apiInstance.get('/projects').then(r => r.data),
  getInvitations: () =>
    apiInstance.get('/invitations').then(r => r.data),
  getTasks: projectId =>
    apiInstance.get(`/projects/${projectId}/tasks`).then(r => r.data),

  createProject: (name, description) =>
    apiInstance.post('/projects', { name, description }).then(r => r.data),
  deleteProject: id =>
    apiInstance.delete(`/projects/${id}`).then(r => r.data),

  createTask: (projectId, title, description) =>
    apiInstance.post(`/projects/${projectId}/tasks`, { title, description }).then(r => r.data),
  updateTask: (projectId, taskId, data) =>
    apiInstance.put(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data),
  deleteTask: (projectId, taskId) =>
    apiInstance.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data),

  inviteUser: (projectId, nickname) =>
    apiInstance.post('/invitations', { projectId, nickname }).then(r => r.data),
  acceptInvitation: invId =>
    apiInstance.put(`/invitations/${invId}/accept`).then(r => r.data),
  declineInvitation: invId =>
    apiInstance.put(`/invitations/${invId}/decline`).then(r => r.data),
};