import api from './api';

export const getAllTasks = () => api.get('/tasks').then(r => r.data);

export const createTask = (task) => api.post('/tasks', task).then(r => r.data);

export const updateTask = (id, task) => api.put(`/tasks/${id}`, task).then(r => r.data);

export const completeTask = (id, data) => api.post(`/tasks/${id}/complete`, data).then(r => r.data);

export const getTodayTasks = () => api.get('/tasks/today').then(r => r.data);

export const getTask = (id) => api.get(`/tasks/${id}`).then(r => r.data);

export const getTaskHistory = (filters) =>
    api.post('/tasks/history', filters).then(r => r.data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);
