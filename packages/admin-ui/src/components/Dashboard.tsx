import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>CMS Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="card">
            <h2>Content Management</h2>
            <p>Manage your pages, projects, and content from here.</p>
            <div className="actions">
              <button className="action-button">Create New Page</button>
              <button className="action-button">Manage Projects</button>
            </div>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="card">
              <h2>User Management</h2>
              <p>Manage users and their roles (Admin only).</p>
              <div className="actions">
                <button className="action-button">View Users</button>
                <button className="action-button">Manage Roles</button>
              </div>
            </div>
          )}
          
          <div className="card">
            <h2>Settings</h2>
            <p>Configure your CMS settings and preferences.</p>
            <div className="actions">
              <button className="action-button">General Settings</button>
              <button className="action-button">Cache Settings</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};