import React from 'react';
import './LearningDetailsModal.css';

const LearningDetailsModal = ({ log, onClose }) => {
    const getDifficultyClass = (level) => {
        if (level === 'EASY') return 'diff-easy';
        if (level === 'MEDIUM') return 'diff-medium';
        return 'diff-hard';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content log-details-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📖 Entry Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="details-grid">
                        <div className="detail-item full-width">
                            <label>Teached Topic</label>
                            <p className="topic-text">{log.topicTitle}</p>
                        </div>

                        <div className="detail-item">
                            <label>Subject Topic Name</label>
                            <p className="subject-box">{log.subject}</p>
                        </div>

                        <div className="detail-item">
                            <label>Lecture Date</label>
                            <p>{new Date(log.lectureDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        <div className="detail-item full-width">
                            <label>Given task by sir</label>
                            <div className="notes-box">
                                {log.assignedTask || "No task assigned."}
                            </div>
                        </div>

                        {log.notes && (
                            <div className="detail-item full-width">
                                <label>My Personal Notes</label>
                                <div className="notes-box">
                                    {log.notes}
                                </div>
                            </div>
                        )}

                        <div className="detail-item full-width meta-item">
                            <label>Logged At</label>
                            <p>{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default LearningDetailsModal;
