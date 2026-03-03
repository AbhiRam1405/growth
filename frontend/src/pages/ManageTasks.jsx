import React, { useState, useEffect, useCallback } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask, completeTask } from '../services/taskService';
import TaskForm from '../components/TaskForm';
import TaskCompletionModal from '../components/TaskCompletionModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import './ManageTasks.css';

const CATEGORY_COLORS = {
    Health: '#10b981', Coding: '#4361ee', Interview: '#f59e0b',
    Reading: '#8b5cf6', Fitness: '#ef4444', Learning: '#06b6d4', Other: '#6b7280',
};

const ManageTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [completingTask, setCompletingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllTasks();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    const handleSubmit = async (form) => {
        setFormLoading(true);
        setFormError('');
        try {
            if (editingTask) {
                await updateTask(editingTask.id, form);
            } else {
                await createTask(form);
            }
            setShowForm(false);
            setEditingTask(null);
            await loadTasks();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormError('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task and all its history?')) return;
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTask(null);
        setFormError('');
    };

    const handleComplete = async (completionData) => {
        setFormLoading(true);
        try {
            await completeTask(completingTask.id, completionData);
            setCompletingTask(null);
            await loadTasks();
        } catch (err) {
            alert('Failed to complete task: ' + err.message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="manage-page">
            <div className="manage-header">
                <div>
                    <h1 className="page-title">Manage Tasks</h1>
                    <p className="page-sub">{tasks.length} task{tasks.length !== 1 ? 's' : ''} configured</p>
                </div>
                {!showForm && (
                    <button className="btn-primary" onClick={() => { setShowForm(true); setEditingTask(null); }}>
                        + Add Task
                    </button>
                )}
            </div>

            {/* Form Panel */}
            {showForm && (
                <div className="form-panel">
                    <h2 className="form-panel-title">{editingTask ? '✏️ Edit Task' : '➕ New Task'}</h2>
                    {formError && <ErrorMessage message={formError} />}
                    <TaskForm
                        initialData={editingTask ? {
                            title: editingTask.title,
                            category: editingTask.category,
                            frequency: editingTask.frequency,
                            scheduledDate: editingTask.scheduledDate,
                            priority: editingTask.priority,
                            mustDo: editingTask.mustDo
                        } : undefined}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={formLoading}
                    />
                </div>
            )}

            {/* Task List */}
            {loading ? (
                <LoadingSpinner message="Loading tasks..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={loadTasks} />
            ) : tasks.length === 0 ? (
                <EmptyState
                    icon="🎯"
                    title="No tasks yet"
                    message="Start building your routine by adding your first task. Track daily habits, weekly goals, and more!"
                    action={{ label: 'Create First Task', onClick: () => setShowForm(true) }}
                />
            ) : (
                <div className="task-table-card">
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Category</th>
                                <th>Frequency</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="task-row">
                                    <td className="task-name-cell">
                                        {task.title}
                                        {task.mustDo && <span className="must-do-mini-badge">Must Do</span>}
                                    </td>
                                    <td>
                                        <span className="cat-pill"
                                            style={{
                                                background: (CATEGORY_COLORS[task.category] || '#6b7280') + '20',
                                                color: CATEGORY_COLORS[task.category] || '#6b7280',
                                            }}>
                                            {task.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`freq-pill ${task.frequency.toLowerCase().replace('-', '')}`}>
                                            {task.frequency}
                                        </span>
                                    </td>
                                    <td>
                                        <PriorityBadge priority={task.priority} />
                                    </td>
                                    <td>
                                        <span className={`status-badge ${task.status?.toLowerCase() || 'pending'}`}>
                                            {task.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-view" onClick={() => setViewingTask(task)}>View</button>
                                        {task.status !== 'COMPLETED' && (
                                            <button className="btn-complete" onClick={() => setCompletingTask(task)}>Done</button>
                                        )}
                                        <button className="btn-edit" onClick={() => handleEdit(task)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(task.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {completingTask && (
                <TaskCompletionModal
                    task={completingTask}
                    onSave={handleComplete}
                    onCancel={() => setCompletingTask(null)}
                    loading={formLoading}
                />
            )}

            {viewingTask && (
                <TaskDetailsModal
                    task={viewingTask}
                    onClose={() => setViewingTask(null)}
                />
            )}
        </div>
    );
};

export default ManageTasks;
