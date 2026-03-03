import React, { useState } from 'react';
import { createLearningLog } from '../services/learningLogService';
import './LearningLogForm.css';

const subjects = ['ML', 'AI', 'DSA', 'Cloud', 'Cyber Security', 'Web Dev', 'OS', 'DBMS', 'Other'];

const LearningLogForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: '',
        topicTitle: '',
        assignedTask: '',
        lectureDate: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.subject || !formData.topicTitle || !formData.lectureDate) {
            setError('Please fill in required fields (Subject, Topic, Date).');
            setLoading(false);
            return;
        }

        try {
            await createLearningLog(formData);
            setSuccess(true);
            setFormData({
                subject: '',
                topicTitle: '',
                assignedTask: '',
                lectureDate: new Date().toISOString().split('T')[0]
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save learning log.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="learning-log-form-container">
            <h2 className="form-title">📝 Record Lecture</h2>
            <form className="learning-log-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Subject Topic Name*</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Lecture Date*</label>
                        <input
                            type="date"
                            name="lectureDate"
                            value={formData.lectureDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Teached Topic*</label>
                        <input
                            type="text"
                            name="topicTitle"
                            value={formData.topicTitle}
                            onChange={handleChange}
                            placeholder="e.g. Backpropagation Algorithm"
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Given task by sir (Optional)</label>
                        <textarea
                            name="assignedTask"
                            value={formData.assignedTask}
                            onChange={handleChange}
                            placeholder="e.g. Solve exercises 1 to 5"
                            rows={3}
                        />
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Entry saved successfully!</div>}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Learning Log'}
                </button>
            </form>
        </div>
    );
};

export default LearningLogForm;
