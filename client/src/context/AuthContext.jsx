import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure browser sends and receives httpOnly cookies with every request
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup 401 Interceptor for automatic logout on session expiration (e.g., 1-hour session timeout)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
          setProfile(null);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Restore session on initial load via /api/auth/me using httpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          setProfile(res.data.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function sending credentials to server to establish httpOnly cookie session
  const login = async (username, password, rememberMe = false) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password, rememberMe });
      const { user: userProfile } = res.data;

      setUser(userProfile);
      setProfile(userProfile);

      return { success: true, user: userProfile };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed.';
      throw new Error(errMsg);
    }
  };

  // Logout function clearing server httpOnly cookie
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout server notification failed:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const token = 'cookie';

  const getToken = () => {
    return 'cookie';
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
