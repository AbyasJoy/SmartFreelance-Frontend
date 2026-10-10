import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount to restore auth state
  useEffect(() => {
    const validateTokenOnMount = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axiosInstance.get('/auth/validate');
          if (response.data && response.data.valid) {
            const updatedUser = {
              id: response.data.userId,
              email: response.data.email,
              role: response.data.role,
              name: user?.name || response.data.email.split('@')[0],
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    validateTokenOnMount();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized-event', handleUnauthorized);
    return () => window.removeEventListener('unauthorized-event', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/users/login', { email, password });
    const { id, name, email: userEmail, role, token: jwtToken } = response.data;

    const userData = { id, name, email: userEmail, role };
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const register = async (name, email, password, role) => {
    const response = await axiosInstance.post('/users/register', { name, email, password, role });
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newObj));
      return newObj;
    });
  };

  const isAuthenticated = !!token && !!user;
  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isClient,
        isFreelancer,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
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
