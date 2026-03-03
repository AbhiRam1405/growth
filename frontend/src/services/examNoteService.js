import api from './api';

const getAllNotes = async () => {
    const response = await api.get('/exam-notes');
    return response.data;
};

const createNote = async (note) => {
    const response = await api.post('/exam-notes', note);
    return response.data;
};

const deleteNote = async (id) => {
    await api.delete(`/exam-notes/${id}`);
};

export default {
    getAllNotes,
    createNote,
    deleteNote
};
