import axios from 'axios';

const API_URL = 'http://localhost:8080/api/exam-notes';

const getAllNotes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const createNote = async (note) => {
    const response = await axios.post(API_URL, note);
    return response.data;
};

const deleteNote = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export default {
    getAllNotes,
    createNote,
    deleteNote
};
