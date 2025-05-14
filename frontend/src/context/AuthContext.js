import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api, { setApiToken } from '../services/api';

const TOKEN_KEY = 'token';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);

useEffect(() => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      setApiToken(token); 
      const decoded = jwtDecode(token);
      if (decoded.userId && decoded.nickname) {
        setUser({ id: decoded.userId, nickname: decoded.nickname });
      } else {
        setUser(null);
      }
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  } else {
    setUser(null);
  }
}, []);


  const login = async (nickname, password) => {
    const { user: u, token } = await api.login(nickname, password);
    localStorage.setItem(TOKEN_KEY, token);
    setApiToken(token);
    setUser(u);
    navigate('/dashboard', { replace: true });
  };

  const register = async (nickname, password) => {
    const { user: u, token } = await api.register(nickname, password);
    localStorage.setItem(TOKEN_KEY, token);
    setApiToken(token);
    setUser(u);
    navigate('/dashboard', { replace: true });
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setApiToken(null);
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export function getToken() {
  return localStorage.getItem('token');
}

export const useAuth = () => useContext(AuthContext);
