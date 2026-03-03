import React, { useState, useEffect, useMemo } from 'react';
import examNoteService from '../services/examNoteService';
import ExamNoteForm from '../components/ExamNoteForm';
import './ExamNotes.css';

const ExamNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchNotes = async () => {
        try {
            const data = await examNoteService.getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleNoteAdded = async (newNote) => {
        const savedNote = await examNoteService.createNote(newNote);
        setNotes([savedNote, ...notes]);
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await examNoteService.deleteNote(id);
            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(note =>
            note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.examType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.noteContent.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [notes, searchTerm]);

    return (
        <div className="exam-notes-page">
            <header className="page-header">
                <h1>Exam Notes</h1>
                <p>Track important topics for Minors and Finals</p>
            </header>

            <div className="page-content">
                <ExamNoteForm onNoteAdded={handleNoteAdded} />

                <div className="notes-list-section">
                    <div className="list-header">
                        <h2>Exam Records</h2>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by subject, exam or content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p className="loading-text">Loading notes...</p>
                    ) : (
                        <div className="table-container">
                            <table className="notes-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Exam Type</th>
                                        <th>Important Note</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNotes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-table-text">
                                                {searchTerm ? 'No matching records found.' : 'No notes yet. Add your first important exam reminder!'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredNotes.map((note) => (
                                            <tr key={note.id}>
                                                <td className="subject-cell">{note.subject}</td>
                                                <td>
                                                    <span className={`exam-badge ${note.examType.toLowerCase().replace(' ', '-')}`}>
                                                        {note.examType}
                                                    </span>
                                                </td>
                                                <td className="content-cell">{note.noteContent}</td>
                                                <td className="date-cell">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="action-cell">
                                                    <button
                                                        className="delete-icon-btn"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        title="Delete note"
                                                    >
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamNotes;
