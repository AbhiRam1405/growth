import React, { useState } from 'react';
import './ExamNoteForm.css';

const ExamNoteForm = ({ onNoteAdded }) => {
    const subjects = [
        'Adv Java',
        'DBMS',
        'Adv ML',
        'Data Science',
        'Cloud Computing',
        'Project',
        'Design and Analysis of Algorithm'
    ];

    const examTypes = ['Minor 1', 'Minor 2', 'Final Exam'];

    const [formData, setFormData] = useState({
        subject: subjects[0],
        examType: examTypes[0],
        noteContent: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.noteContent.trim()) return;

        setIsSubmitting(true);
        try {
            await onNoteAdded(formData);
            setFormData({ ...formData, noteContent: '' });
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="exam-note-form-container">
            <h3>Add Exam Note</h3>
            <form onSubmit={handleSubmit} className="exam-note-form">
                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                        {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="examType">Exam Type</label>
                    <select
                        id="examType"
                        value={formData.examType}
                        onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    >
                        {examTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="noteContent">Important Note</label>
                    <textarea
                        id="noteContent"
                        placeholder="Enter important topics, formulas, or reminders..."
                        value={formData.noteContent}
                        onChange={(e) => setFormData({ ...formData, noteContent: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Save Note'}
                </button>
            </form>
        </div>
    );
};

export default ExamNoteForm;
