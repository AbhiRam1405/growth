import api from './api';

export const createLearningLog = (data) =>
    api.post('/learning-log', data).then(r => r.data);

export const getAllLearningLogs = () =>
    api.get('/learning-log').then(r => r.data);

export const searchLearningLogs = (filters) =>
    api.post('/learning-log/search', filters).then(r => r.data);

export const getLearningLog = (id) =>
    api.get(`/learning-log/${id}`).then(r => r.data);

export const deleteLearningLog = (id) =>
    api.delete(`/learning-log/${id}`);
