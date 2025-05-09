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


const api = {
  register: (nickname, password) =>
    apiInstance.post('/auth/register', { nickname, password }).then(res => res.data),
  login: (nickname, password) =>
    apiInstance.post('/auth/login', { nickname, password }).then(res => res.data),
  logout: () =>
    apiInstance.post('/auth/logout').then(res => res.data),
  getSession: () =>
    apiInstance.get('/auth/session').then(res => res.data),

  getProjects: () =>
    apiInstance.get('/projects').then(res => res.data),
  getInvitations: () =>
    apiInstance.get('/invitations').then(res => res.data),
  getTasks: projectId =>
    apiInstance.get(`/projects/${projectId}/tasks`).then(res => res.data),

  createProject: (name, description) =>
    apiInstance.post('/projects', { name, description }).then(res => res.data),
  deleteProject: projectId =>
    apiInstance.delete(`/projects/${projectId}`).then(res => res.data),
  createTask: (projectId, title, description) =>
    apiInstance.post(`/projects/${projectId}/tasks`, { title, description }).then(res => res.data),
  updateTask: (projectId, taskId, data) =>
    apiInstance.put(`/projects/${projectId}/tasks/${taskId}`, data).then(res => res.data),
  deleteTask: (projectId, taskId) =>
    apiInstance.delete(`/projects/${projectId}/tasks/${taskId}`).then(res => res.data),

  inviteUser: (projectId, nickname) =>
    apiInstance.post('/invitations', { projectId, nickname }).then(res => res.data),
  acceptInvitation: invId =>
    apiInstance.put(`/invitations/${invId}/accept`).then(res => res.data),
  declineInvitation: invId =>
    apiInstance.put(`/invitations/${invId}/decline`).then(res => res.data),
};

export default api;