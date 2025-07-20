import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data); 
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);

      // Fetch full user data after login
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });

      setUser(userRes.data); // 👈 Store full user object
      toast.success('Login successful!');
      return userRes.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'Customer', additionalFields = {}) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role,
        ...additionalFields,
      });
      localStorage.setItem('token', response.data.token);

      // Fetch full user data after registration
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });

      setUser(userRes.data); // 👈 Store full user object
      toast.success('Registration successful!');
      return userRes.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
