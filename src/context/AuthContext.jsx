import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('wv_token');
      const savedUser = localStorage.getItem('wv_user');

      if (savedToken && savedUser && savedUser !== 'undefined') {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Invalid stored auth data:', error);
      localStorage.removeItem('wv_token');
      localStorage.removeItem('wv_user');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem('wv_token', jwtToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem('wv_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wv_token');
    localStorage.removeItem('wv_user');
  };

  const value = { user, token, login, logout, loading, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
