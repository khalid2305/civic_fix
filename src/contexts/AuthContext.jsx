import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('civicfix_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    const userWithId = { ...(data.user || data), id: (data.user || data)._id };
    setUser(userWithId);
    localStorage.setItem('civicfix_user', JSON.stringify(userWithId));
    localStorage.setItem('civicfix_token', data.token);
    return data;
  };

  const loginWithGoogle = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock_google_token' })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Google Login failed');

    const userWithId = { ...(data.user || data), id: (data.user || data)._id };
    setUser(userWithId);
    localStorage.setItem('civicfix_user', JSON.stringify(userWithId));
    localStorage.setItem('civicfix_token', data.token);
    return data;
  };

  const loginWithOTP = async (phone, otp) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    const data = await response.json();
    if (response.ok) {
        const userWithId = { ...(data.user || data), id: (data.user || data)._id };
        setUser(userWithId);
        localStorage.setItem('civicfix_user', JSON.stringify(userWithId));
        localStorage.setItem('civicfix_token', data.token);
        return true;
      } else {
        throw new Error(data.message || 'OTP Login failed');
      }
  };

  const sendOTP = async (phone) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/otp-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  };

  const register = async (name, email, phone, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');

    const userWithId = { ...(data.user || data), id: (data.user || data)._id };
    setUser(userWithId);
    localStorage.setItem('civicfix_user', JSON.stringify(userWithId));
    localStorage.setItem('civicfix_token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicfix_user');
    localStorage.removeItem('civicfix_token');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithOTP, sendOTP, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
