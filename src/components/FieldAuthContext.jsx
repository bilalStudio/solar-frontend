import { createContext, useContext, useState, useEffect } from 'react';

const FieldAuthContext = createContext(null);

export function useFieldAuth() {
  return useContext(FieldAuthContext);
}

export function FieldAuthProvider({ children }) {
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('wv_field_user');
    if (stored) {
      try { setTech(JSON.parse(stored)); }
      catch (e) { localStorage.removeItem('wv_field_user'); }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('wv_field_user', JSON.stringify(userData));
    setTech(userData);
  };

  const logout = () => {
    localStorage.removeItem('wv_field_user');
    setTech(null);
  };

  return (
    <FieldAuthContext.Provider value={{ tech, login, logout, loading }}>
      {children}
    </FieldAuthContext.Provider>
  );
}

export function FieldProtectedRoute({ children }) {
  const { tech, loading } = useFieldAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!tech) {
    window.location.href = '/field/login';
    return null;
  }
  return children;
}
