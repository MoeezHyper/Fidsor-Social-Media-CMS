import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, createUserApi, updateUserPermissionsApi, deleteUserApi } from '../api/userApi';
import { Users, UserPlus, Shield, Facebook, Instagram, Trash2, AlertCircle, CheckCircle2, RefreshCw, User, Lock, Check, X, ShieldCheck, Search, Filter, ArrowUpDown, Plus } from 'lucide-react';

export default function UserManagement() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search, Filter, and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'user'
  const [sortBy, setSortBy] = useState('username_asc'); // 'username_asc' | 'username_desc' | 'role'

  // Form State for creating a user (strictly 2 fields: Username & Password)
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [canFb, setCanFb] = useState(true);
  const [canIg, setCanIg] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(getToken());
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) {
      setError('Please provide both username and password.');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await createUserApi(
        {
          username: newUsername.trim(),
          password: newPassword,
          can_publish_facebook: canFb,
          can_publish_instagram: canIg
        },
        getToken()
      );

      setSuccessMsg(`User '${newUsername.trim()}' created successfully!`);
      setNewUsername('');
      setNewPassword('');
      setCanFb(true);
      setCanIg(true);
      setShowCreateModal(false);
      await loadUsers();
    } catch (err) {
      console.error('Create user error:', err);
      setError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePermission = async (userItem, field, currentValue) => {
    const updated = !currentValue;
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userItem.id ? { ...u, [field]: updated } : u));

    try {
      await updateUserPermissionsApi(
        userItem.id,
        {
          can_publish_facebook: field === 'can_publish_facebook' ? updated : userItem.can_publish_facebook,
          can_publish_instagram: field === 'can_publish_instagram' ? updated : userItem.can_publish_instagram
        },
        getToken()
      );
    } catch (err) {
      console.error('Permission update error:', err);
      setError(err.message || 'Failed to update permission.');
      // Revert optimistic update
      setUsers(prev => prev.map(u => u.id === userItem.id ? { ...u, [field]: currentValue } : u));
    }
  };

  const handleDeleteUser = async (userItem) => {
    if (userItem.username === 'admin') {
      alert('The primary admin account cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user '${userItem.username}'?`)) {
      return;
    }

    try {
      await deleteUserApi(userItem.id, getToken());
      setSuccessMsg(`User '${userItem.username}' deleted.`);
      setUsers(prev => prev.filter(u => u.id !== userItem.id));
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.message || 'Failed to delete user.');
    }
  };

  // Metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin' || u.username === 'admin').length;
  const fbCount = users.filter(u => u.can_publish_facebook !== false).length;
  const igCount = users.filter(u => u.can_publish_instagram !== false).length;

  // Filtered and Sorted Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isAdmin = u.role === 'admin' || u.username === 'admin';
    const matchesRole = roleFilter === 'all' || (roleFilter === 'admin' ? isAdmin : !isAdmin);
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'username_asc') {
      return a.username.localeCompare(b.username);
    }
    if (sortBy === 'username_desc') {
      return b.username.localeCompare(a.username);
    }
    if (sortBy === 'role') {
      const aAdmin = a.role === 'admin' || a.username === 'admin' ? 0 : 1;
      const bAdmin = b.role === 'admin' || b.username === 'admin' ? 0 : 1;
      return aAdmin - bAdmin;
    }
    return 0;
  });

  return (
    <div className="page-wrapper">
      {/* Header Bar */}
      <div className="page-header-bar" style={{ marginBottom: '2.25rem' }}>
        <div>
          <div className="header-title-wrapper">
            <h1 className="page-title">User Management</h1>
            <span className="badge-pill-accent">
              <ShieldCheck size={14} />
              Access Control
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: '0.4rem' }}>
            Manage user accounts, credentials, and platform publishing access rights.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="user-mgmt-stats-grid">
        <div className="stat-mini-card">
          <div className="stat-icon-bg icon-indigo">
            <Users size={18} />
          </div>
          <div className="stat-mini-details">
            <span className="stat-mini-value">{loading ? '...' : totalUsers}</span>
            <span className="stat-mini-label">Total Accounts</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-icon-bg icon-purple">
            <Shield size={18} />
          </div>
          <div className="stat-mini-details">
            <span className="stat-mini-value">{loading ? '...' : adminCount}</span>
            <span className="stat-mini-label">Admins</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-icon-bg icon-blue">
            <Facebook size={18} />
          </div>
          <div className="stat-mini-details">
            <span className="stat-mini-value">{loading ? '...' : fbCount}</span>
            <span className="stat-mini-label">FB Publishing Enabled</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-icon-bg icon-pink">
            <Instagram size={18} />
          </div>
          <div className="stat-mini-details">
            <span className="stat-mini-value">{loading ? '...' : igCount}</span>
            <span className="stat-mini-label">IG Publishing Enabled</span>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="alert-banner alert-banner-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button className="alert-dismiss" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert-banner alert-banner-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
          <button className="alert-dismiss" onClick={() => setSuccessMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Full Width User Table Card */}
      <div className="panel-card user-table-card full-width-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <Users size={19} style={{ color: 'var(--accent-primary)' }} />
              System Accounts & Access Rights
            </h3>
            <p className="section-subtitle">Search, filter, and manage platform permissions for CMS users</p>
          </div>

          <div className="header-action-toolbar">
            <button
              className="btn-add-user-primary"
              onClick={() => setShowCreateModal(true)}
              id="open-create-user-modal"
            >
              <UserPlus size={16} />
              <span>Add New User</span>
            </button>

            <button className="btn-refresh-secondary" onClick={loadUsers} title="Refresh User List">
              <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="table-controls-bar">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="filter-sort-group">
            <div className="role-filter-pills">
              <button
                className={`filter-pill ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                All ({users.length})
              </button>
              <button
                className={`filter-pill ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                Admins ({users.filter(u => u.role === 'admin' || u.username === 'admin').length})
              </button>
              <button
                className={`filter-pill ${roleFilter === 'user' ? 'active' : ''}`}
                onClick={() => setRoleFilter('user')}
              >
                Users ({users.filter(u => u.role !== 'admin' && u.username !== 'admin').length})
              </button>
            </div>

            <div className="sort-dropdown-wrapper">
              <ArrowUpDown size={14} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="username_asc">Sort: A to Z</option>
                <option value="username_desc">Sort: Z to A</option>
                <option value="role">Sort: Admins First</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="state-placeholder">
            <div className="spinner" />
            <span>Loading user accounts...</span>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="state-placeholder">
            <span>{searchQuery || roleFilter !== 'all' ? 'No users match your filter criteria.' : 'No user accounts found.'}</span>
          </div>
        ) : (
          <>
            <div className="mobile-table-swipe-hint">
              ← Swipe table left/right to view rights & actions →
            </div>
            <div className="table-responsive">
              <table className="user-minimal-table">
                <thead>
                  <tr>
                    <th>User Account</th>
                    <th>Role</th>
                    <th>Facebook Access</th>
                    <th>Instagram Access</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => {
                    const isAdmin = u.role === 'admin' || u.username === 'admin';
                    const initialLetter = (u.username || 'U').charAt(0).toUpperCase();

                    return (
                      <tr key={u.id} className={isAdmin ? 'row-admin' : ''}>
                        <td>
                          <div className="user-table-name-cell">
                            <div className={`user-avatar-badge ${isAdmin ? 'avatar-admin' : 'avatar-user'}`}>
                              {initialLetter}
                            </div>
                            <span className="user-table-username">{u.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`user-role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
                            {isAdmin && <Shield size={11} />}
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td>
                          <div className="switch-cell">
                            <label className={`switch-toggle ${isAdmin ? 'disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={u.can_publish_facebook !== false}
                                onChange={() => handleTogglePermission(u, 'can_publish_facebook', u.can_publish_facebook !== false)}
                                disabled={isAdmin}
                              />
                              <span className="switch-slider" />
                            </label>
                            <span className={`switch-status-text ${u.can_publish_facebook !== false ? 'status-active' : 'status-disabled'}`}>
                              {u.can_publish_facebook !== false ? 'Allowed' : 'Off'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="switch-cell">
                            <label className={`switch-toggle ${isAdmin ? 'disabled' : ''}`}>
                              <input
                                type="checkbox"
                                checked={u.can_publish_instagram !== false}
                                onChange={() => handleTogglePermission(u, 'can_publish_instagram', u.can_publish_instagram !== false)}
                                disabled={isAdmin}
                              />
                              <span className="switch-slider" />
                            </label>
                            <span className={`switch-status-text ${u.can_publish_instagram !== false ? 'status-active' : 'status-disabled'}`}>
                              {u.can_publish_instagram !== false ? 'Allowed' : 'Off'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!isAdmin ? (
                            <button
                              className="icon-action-btn delete-action"
                              onClick={() => handleDeleteUser(u)}
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span className="protected-tag" title="Admin account protected">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add New User Modal Dialog */}
      {showCreateModal && ReactDOM.createPortal(
        <div className="modal-backdrop">
          <div className="modal-card user-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h3 className="modal-card-title">
                  <UserPlus size={19} style={{ color: 'var(--accent-primary)' }} />
                  Add New User Account
                </h3>
                <p className="modal-card-subtitle">Create CMS credentials and assign posting permissions</p>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowCreateModal(false)}
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="user-create-form">
              <div className="form-group">
                <label htmlFor="new-username" className="form-label">
                  Username
                </label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    id="new-username"
                    type="text"
                    className="custom-textarea minimal-input"
                    placeholder="e.g. social_editor"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  Password
                </label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="new-password"
                    type="password"
                    className="custom-textarea minimal-input"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Initial Permissions Selection Box */}
              <div className="rights-selection-box">
                <span className="rights-box-title">Initial Platform Rights</span>
                
                <div className="rights-toggle-row">
                  <div className="rights-info">
                    <Facebook size={17} style={{ color: 'var(--facebook-color)' }} />
                    <span>Facebook Publishing</span>
                  </div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={canFb}
                      onChange={(e) => setCanFb(e.target.checked)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                <div className="rights-toggle-row">
                  <div className="rights-info">
                    <Instagram size={17} style={{ color: '#dc2743' }} />
                    <span>Instagram Publishing</span>
                  </div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={canIg}
                      onChange={(e) => setCanIg(e.target.checked)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-primary"
                  disabled={creating}
                  id="create-user-submit"
                >
                  {creating ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
