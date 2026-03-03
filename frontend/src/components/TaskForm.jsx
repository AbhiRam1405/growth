import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const CATEGORIES = ['Health', 'Coding', 'Interview', 'Reading', 'Fitness', 'Learning', 'Other'];

const TaskForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [form, setForm] = useState({
        title: '',
        category: 'Coding',
        frequency: 'Daily',
        priority: 'MEDIUM',
        mustDo: false,
        ...initialData,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) setForm({ ...initialData });
    }, [initialData]);

    const handleChange = (e) => {
        setError('');
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        onSubmit(form);
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Morning Run, LeetCode Practice…"
                    className={`form-input ${error ? 'input-error' : ''}`}
                    maxLength={80}
                />
                {error && <span className="form-error">{error}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className="form-select">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <div className="freq-toggle">
                        {['Daily', 'Weekly', 'One-time'].map(f => (
                            <button
                                key={f}
                                type="button"
                                className={`freq-btn ${form.frequency === f ? 'active' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, frequency: f }))}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent 🔥</option>
                    </select>
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="mustDo"
                            checked={form.mustDo}
                            onChange={(e) => setForm(prev => ({ ...prev, mustDo: e.target.checked }))}
                        />
                        <span>Daily "Must Do" (Reminds at 15:00 & 21:00)</span>
                    </label>
                </div>
            </div>

            {form.frequency === 'One-time' && (
                <div className="form-group">
                    <label className="form-label">Scheduled Date</label>
                    <input
                        type="date"
                        name="scheduledDate"
                        value={form.scheduledDate || ''}
                        onChange={handleChange}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>
            )}

            <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving…' : (initialData ? 'Update Task' : 'Add Task')}
                </button>
                {onCancel && (
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default TaskForm;
