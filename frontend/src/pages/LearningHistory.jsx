import React, { useState, useEffect } from 'react';
import { searchLearningLogs, deleteLearningLog } from '../services/learningLogService';
import LearningLogForm from '../components/LearningLogForm';
import LearningDetailsModal from '../components/LearningDetailsModal';
import './LearningHistory.css';

const subjects = ['ML', 'AI', 'DSA', 'Cloud', 'Cyber Security', 'Web Dev', 'OS', 'DBMS', 'Other'];
const difficulties = ['EASY', 'MEDIUM', 'HARD'];

const LearningHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({
        subject: '',
        startDate: '',
        endDate: '',
        searchKeyword: '',
        sortBy: 'latest'
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await searchLearningLogs(filters);
            setLogs(data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const resetFilters = () => {
        const reset = {
            subject: '',
            startDate: '',
            endDate: '',
            searchKeyword: '',
            sortBy: 'latest'
        };
        setFilters(reset);
        searchLearningLogs(reset).then(setLogs);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteLearningLog(id);
                fetchLogs();
            } catch (err) {
                alert('Failed to delete.');
            }
        }
    };

    return (
        <div className="learning-history-page">
            <div className="page-header">
                <h1 className="page-title">📚 College Learning Logs</h1>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Close Form' : 'Add New Entry'}
                </button>
            </div>

            {showForm && (
                <div className="form-section">
                    <LearningLogForm onSuccess={() => { fetchLogs(); setShowForm(false); }} />
                </div>
            )}

            <div className="filter-card">
                <form className="filter-grid" onSubmit={applyFilters}>
                    <div className="filter-group">
                        <label>Subject Topic Name</label>
                        <select name="subject" value={filters.subject} onChange={handleFilterChange}>
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>From Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>To Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>Search Keyword</label>
                        <input type="text" name="searchKeyword" value={filters.searchKeyword} onChange={handleFilterChange} placeholder="Search topics or tasks..." />
                    </div>
                    <div className="filter-actions full-width">
                        <button type="submit" className="btn-filter" disabled={loading}>
                            {loading ? 'Searching...' : '🔍 Apply Filters'}
                        </button>
                        <button type="button" className="btn-reset" onClick={resetFilters}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="history-card">
                {logs.length === 0 ? (
                    <div className="empty-history">
                        <p>No learning logs found. Start by adding one!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject Topic Name</th>
                                    <th>Teached Topic</th>
                                    <th>Given Task by Sir</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.lectureDate).toLocaleDateString()}</td>
                                        <td><span className="log-subject">{log.subject}</span></td>
                                        <td className="log-topic">{log.topicTitle}</td>
                                        <td className="log-task">{log.assignedTask || <span className="no-task">None</span>}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-view" onClick={() => setSelectedLog(log)}>Details</button>
                                                <button className="btn-delete" onClick={() => handleDelete(log.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )).reverse()}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedLog && (
                <LearningDetailsModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
};

export default LearningHistory;
