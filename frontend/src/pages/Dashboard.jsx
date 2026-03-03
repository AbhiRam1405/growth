import React, { useState, useEffect, useCallback } from 'react';
import { getTasksWithStatus, markStatus, getDailySummary } from '../services/statusService';
import { getWeeklyAnalytics, getRandomQuote, getSuggestion } from '../services/analyticsService';
import { completeTask, getTodayTasks } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskCompletionModal from '../components/TaskCompletionModal';
import SummaryCard from '../components/SummaryCard';
import QuoteCard from '../components/QuoteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import LineChart from '../charts/LineChart';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const todayStr = new Date().toISOString().split('T')[0];

const Dashboard = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [quote, setQuote] = useState(null);
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(true);
    const [completingTask, setCompletingTask] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');

    const isToday = selectedDate === todayStr;

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [tasksData, summaryData, analyticsData, quoteData, suggData] = await Promise.all([
                isToday ? getTodayTasks() : getTasksWithStatus(selectedDate),
                getDailySummary(selectedDate),
                getWeeklyAnalytics(),
                getRandomQuote(),
                getSuggestion(),
            ]);
            setTasks(tasksData);
            setSummary(summaryData);
            setAnalytics(analyticsData);
            setQuote(quoteData);
            setSuggestion(suggData.suggestion || '');

            // Trigger summary recompute to ensure freshness (non-blocking)
            if (tasksData.length > 0) {
                const firstTask = tasksData[0];
                markStatus(firstTask.taskId, selectedDate, firstTask.completed).catch(() => { });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, isToday]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleToggle = async (taskId, completed) => {
        if (completed) {
            const task = tasks.find(t => t.taskId === taskId);
            setCompletingTask({ ...task, id: task.taskId }); // Align ID for modal
            return;
        }

        try {
            await markStatus(taskId, selectedDate, false);
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCompleteSave = async (completionData) => {
        setModalLoading(true);
        try {
            // Updated to use the new recurring task completion API
            await completeTask(completingTask.id, completionData);

            setCompletingTask(null);
            await loadData();
        } catch (err) {
            alert('Failed to complete task: ' + err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    if (loading) return <LoadingSpinner message="Loading your progress..." />;
    if (error) return <ErrorMessage message={error} onRetry={loadData} />;

    const completionPct = summary?.completionPercentage?.toFixed(1) ?? '0.0';
    const streak = summary?.streak ?? 0;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Good {getGreeting()}! 👋</h1>
                    <div className="date-nav">
                        <button className="date-nav-btn" onClick={() => changeDate(-1)}>←</button>
                        <p className="page-sub">
                            {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {isToday && " (Today)"}
                        </p>
                        <button className="date-nav-btn" onClick={() => changeDate(1)}>→</button>
                        {!isToday && (
                            <button className="btn-today" onClick={() => setSelectedDate(todayStr)}>Today</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote */}
            <QuoteCard quote={quote} />

            {/* Suggestion Banner */}
            {suggestion && (
                <div className="suggestion-banner">
                    <span className="suggestion-icon">🤖</span>
                    <p className="suggestion-text">{suggestion}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <SummaryCard
                    icon={completionPct === '100.0' ? "✅" : (completionPct === '0.0' ? "⭕" : "📊")}
                    label={`${isToday ? "Today's" : "Day's"} Progress`}
                    value={`${completionPct}%`}
                    sub={`${tasks.filter(t => t.completed).length} / ${tasks.length} tasks`}
                    color="#4361ee" />
                <SummaryCard icon="🔥" label="Current Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`}
                    sub={streak >= 1 ? 'Keep it going!' : 'Start your streak today!'} color="#f59e0b" />
                <SummaryCard icon="📊" label="Weekly Average" value={`${analytics?.weeklyAverage?.toFixed(1) ?? 0}%`}
                    sub="Last 7 days" color="#10b981" />
                <SummaryCard icon="⚠️" label="Needs Attention" value={analytics?.weakestTask ?? 'N/A'}
                    sub="Weakest task this week" color="#ef4444" />
            </div>

            {/* Tasks Section */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">📋 {isToday ? "Today's" : "Scheduled"} Tasks</h2>
                    <span className="section-badge">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                    <EmptyState
                        icon="📝"
                        title="No tasks for this day"
                        message={isToday ? "Add your first task to start tracking your daily progress!" : "No tasks were scheduled or found for this date."}
                        action={isToday ? { label: 'Add Your First Task', onClick: () => navigate('/tasks') } : undefined}
                    />
                ) : (
                    <div className="tasks-list">
                        {tasks.map(task => (
                            <TaskCard key={task.taskId} task={task} onToggle={handleToggle} />
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Chart */}
            {analytics?.dailyProgress?.length > 0 && (
                <div className="section-card">
                    <h2 className="section-title">📈 7-Day Progress</h2>
                    <LineChart data={analytics.dailyProgress} />
                </div>
            )}

            {completingTask && (
                <TaskCompletionModal
                    task={completingTask}
                    onSave={handleCompleteSave}
                    onCancel={() => setCompletingTask(null)}
                    loading={modalLoading}
                />
            )}
        </div>
    );
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
}

export default Dashboard;
