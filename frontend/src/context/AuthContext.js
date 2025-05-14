import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TOKEN_KEY = 'token';
function setSession(token) { localStorage.setItem(TOKEN_KEY, token); }
function clearSession() { localStorage.removeItem(TOKEN_KEY); }
function getToken() { return localStorage.getItem(TOKEN_KEY); }

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  
   useEffect(() => {
     (async () => {
      const session = await api.getSession();
      if (session.authenticated) {
        setUser({ id: session.userId });
      }
     })();
   }, []);

  const login = async (nickname, password) => {
  const { user: u } = await api.login(nickname, password);
  setUser(u);
  navigate('/dashboard', { replace: true });
};


  const register = async (nickname, password) => {
    await api.register(nickname, password);
    
    navigate('/login', { state: { fromRegister: true } });
  };

  const logout = async () => {
    await api.logout();
    clearSession();
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
