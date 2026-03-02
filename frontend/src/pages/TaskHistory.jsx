import React, { useState, useEffect, useCallback } from 'react';
import { getTaskHistory } from '../services/taskService';
import TaskDetailsModal from '../components/TaskDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PriorityBadge from '../components/PriorityBadge';
import './TaskHistory.css';
import './ManageTasks.css'; // Reuse table styles

const TaskHistory = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingTask, setViewingTask] = useState(null);

    // Filters State
    const [filters, setFilters] = useState({
        category: '',
        startDate: '',
        endDate: '',
        minTimeSpent: '',
        maxTimeSpent: '',
        searchKeyword: '',
        sortBy: 'latest',
        priority: '',
        page: 0,
        size: 10
    });

    const loadHistory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Map empty strings to null for backend enum/criteria safety
            const cleanFilters = { ...filters };
            Object.keys(cleanFilters).forEach(key => {
                if (cleanFilters[key] === '') {
                    cleanFilters[key] = null;
                }
            });

            const data = await getTaskHistory(cleanFilters);
            setTasks(data);
        } catch (err) {
            setError(err.message || 'Failed to load task history');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 0 // Reset to first page on filter change
        }));
    };

    const resetFilters = () => {
        setFilters({
            category: '',
            startDate: '',
            endDate: '',
            minTimeSpent: '',
            maxTimeSpent: '',
            searchKeyword: '',
            sortBy: 'latest',
            priority: '',
            page: 0,
            size: 10
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="history-page">
            <div className="history-header">
                <h1 className="page-title">📜 Task History</h1>
                <p className="page-sub">View and analyze your completed tasks</p>
            </div>

            {/* Filters Section */}
            <div className="filter-card">
                <div className="filter-grid">
                    <div className="filter-group">
                        <label className="filter-label">Search</label>
                        <input
                            type="text"
                            name="searchKeyword"
                            placeholder="Search title..."
                            className="filter-input"
                            value={filters.searchKeyword}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <select
                            name="category"
                            className="filter-select"
                            value={filters.category}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Categories</option>
                            <option value="Health">Health</option>
                            <option value="Coding">Coding</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Reading">Reading</option>
                            <option value="Learning">Learning</option>
                            <option value="Interview">Interview</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                            name="sortBy"
                            className="filter-select"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                        >
                            <option value="latest">Latest Completed</option>
                            <option value="oldest">Oldest Completed</option>
                            <option value="time_desc">Highest Time Spent</option>
                            <option value="priority">Priority (High to Low)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Priority</label>
                        <select
                            name="priority"
                            className="filter-select"
                            value={filters.priority}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            className="filter-input"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            className="filter-input"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-actions">
                        <button className="btn-reset" onClick={resetFilters}>Reset</button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="task-table-card">
                {loading && tasks.length === 0 ? (
                    <LoadingSpinner message="Searching history..." />
                ) : error ? (
                    <ErrorMessage message={error} onRetry={loadHistory} />
                ) : tasks.length === 0 ? (
                    <div className="no-results">No completed tasks found matching your filters.</div>
                ) : (
                    <>
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Time Spent</th>
                                    <th>Completed At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} className="task-row">
                                        <td className="task-name-cell">{task.title}</td>
                                        <td>
                                            <span className="cat-pill" style={{
                                                background: 'rgba(67, 97, 238, 0.1)',
                                                color: '#4361ee'
                                            }}>
                                                {task.category}
                                            </span>
                                        </td>
                                        <td>
                                            <PriorityBadge priority={task.priority} />
                                        </td>
                                        <td>{task.timeSpent ? `${task.timeSpent} mins` : 'N/A'}</td>
                                        <td className="date-cell">{formatDate(task.completedAt)}</td>
                                        <td>
                                            <button
                                                className="btn-view"
                                                onClick={() => setViewingTask(task)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="pagination-controls">
                            <button
                                className="btn-pagination"
                                disabled={filters.page === 0 || loading}
                                onClick={() => handlePageChange(filters.page - 1)}
                            >
                                Previous
                            </button>
                            <span className="page-info">Page {filters.page + 1}</span>
                            <button
                                className="btn-pagination"
                                disabled={tasks.length < filters.size || loading}
                                onClick={() => handlePageChange(filters.page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {viewingTask && (
                <TaskDetailsModal
                    task={viewingTask}
                    onClose={() => setViewingTask(null)}
                />
            )}
        </div>
    );
};

export default TaskHistory;
