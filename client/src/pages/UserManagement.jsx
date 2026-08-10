import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, createUserApi, updateUserPermissionsApi, deleteUserApi } from '../api/userApi';
import { Users, UserPlus, Shield, Facebook, Instagram, Trash2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function UserManagement() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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

  return (
    <div className="page-wrapper">
      <div className="page-header-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">
              User Management
            </h1>
            <Shield size={22} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <p className="page-subtitle">
            Create CMS users (Username & Password) and manage granular Facebook and Instagram posting permissions.
          </p>
        </div>

        <button className="btn-secondary refresh-btn" onClick={loadUsers} title="Refresh User List">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            color: 'var(--danger-color)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            color: 'var(--success-color)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="user-mgmt-grid">
        {/* Left Column: Create User Form (2 Fields: Username & Password) */}
        <div className="panel-card" style={{ height: 'fit-content' }}>
          <div className="section-header">
            <h3 className="section-title">
              <UserPlus size={20} style={{ color: 'var(--accent-primary)' }} />
              Add New User
            </h3>
            <p className="section-subtitle">Only Username and Password required</p>
          </div>

          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="new-username"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}
              >
                Username
              </label>
              <input
                id="new-username"
                type="text"
                className="custom-textarea"
                style={{ minHeight: 'auto', height: '42px', paddingTop: 0, paddingBottom: 0 }}
                placeholder="e.g. editor1"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="new-password"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}
              >
                Password
              </label>
              <input
                id="new-password"
                type="password"
                className="custom-textarea"
                style={{ minHeight: 'auto', height: '42px', paddingTop: 0, paddingBottom: 0 }}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Initial Permissions Checklist */}
            <div style={{ marginBottom: '1.5rem', background: 'var(--dropzone-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.6rem' }}>
                Initial Platform Rights:
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={canFb}
                  onChange={(e) => setCanFb(e.target.checked)}
                />
                <Facebook size={16} style={{ color: 'var(--facebook-color)' }} />
                <span>Facebook Posting</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={canIg}
                  onChange={(e) => setCanIg(e.target.checked)}
                />
                <Instagram size={16} style={{ color: '#dc2743' }} />
                <span>Instagram Posting</span>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={creating} id="create-user-submit">
              {creating ? (
                <>
                  <div className="spinner" />
                  <span>Creating User...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create User</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Users List & Platform Permissions Table */}
        <div className="panel-card">
          <div className="section-header">
            <h3 className="section-title">
              <Users size={20} style={{ color: 'var(--accent-primary)' }} />
              System Accounts & Permissions
            </h3>
            <p className="section-subtitle">Toggle platform access rights for each CMS user account</p>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
              <span>Loading user accounts...</span>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No user accounts found.
            </div>
          ) : (
            <>
              <div className="mobile-table-swipe-hint">
                ← Swipe table left/right to view permissions & actions →
              </div>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: '520px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>User</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Facebook Rights</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Instagram Rights</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin' || u.username === 'admin';

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {u.username}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              background: isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                              color: isAdmin ? 'var(--accent-primary)' : 'var(--text-muted)',
                              textTransform: 'uppercase'
                            }}
                          >
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={u.can_publish_facebook !== false}
                              onChange={() => handleTogglePermission(u, 'can_publish_facebook', u.can_publish_facebook !== false)}
                              disabled={isAdmin}
                            />
                            <span style={{ fontSize: '0.85rem', color: u.can_publish_facebook !== false ? 'var(--text-main)' : 'var(--text-dim)' }}>
                              {u.can_publish_facebook !== false ? 'Allowed' : 'Disabled'}
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={u.can_publish_instagram !== false}
                              onChange={() => handleTogglePermission(u, 'can_publish_instagram', u.can_publish_instagram !== false)}
                              disabled={isAdmin}
                            />
                            <span style={{ fontSize: '0.85rem', color: u.can_publish_instagram !== false ? 'var(--text-main)' : 'var(--text-dim)' }}>
                              {u.can_publish_instagram !== false ? 'Allowed' : 'Disabled'}
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {!isAdmin && (
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => handleDeleteUser(u)}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
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
      </div>
    </div>
  );
}
