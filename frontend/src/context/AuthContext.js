import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

function setSession(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const login = async (nickname, password) => {
    const { token } = await api.login(nickname, password);
    setSession(token);
    const sessionUser = await api.getSession();
    setUser(sessionUser);
    navigate('/', { replace: true });
  };

  const register = async (nickname, password) => {
    await api.register(nickname, password);
    navigate('/login', { state: { fromRegister: true } });
  };

  const logout = async () => {
    await api.logout();
    clearSession();
    setUser(null);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (token) {
        try {
          const sessionUser = await api.getSession();
          setUser(sessionUser);
        } catch {
          clearSession();
        }
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);