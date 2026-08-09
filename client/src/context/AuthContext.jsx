import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fidsor_auth_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on initial load via /api/auth/me
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('fidsor_auth_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (res.data?.user) {
          setUser(res.data.user);
          setProfile(res.data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem('fidsor_auth_token');
          setToken(null);
        }
      } catch (err) {
        console.warn('Session restoration warning:', err.message);
        localStorage.removeItem('fidsor_auth_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function accepting Username & Password via backend API
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const { token: authToken, user: userProfile } = res.data;

      setToken(authToken);
      setUser(userProfile);
      setProfile(userProfile);
      localStorage.setItem('fidsor_auth_token', authToken);

      return { success: true, user: userProfile };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed.';
      throw new Error(errMsg);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('fidsor_auth_token');
  };

  const getToken = () => {
    return token || localStorage.getItem('fidsor_auth_token') || '';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        logout,
        getToken,
        isAdmin: profile?.role === 'admin' || profile?.username === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
