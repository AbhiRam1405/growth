import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="brand-icon">🌱</span>
                <span className="brand-name">GrowthOS</span>
            </div>
            <div className="navbar-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Dashboard
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Manage Tasks
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Analytics
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Task History
                </NavLink>
                <NavLink to="/learning-log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Learning Log
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
