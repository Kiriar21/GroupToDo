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

  const login = async (nickname, password) => {
    const { token } = await api.login(nickname, password);
    setSession(token);
    const sessionUser = await api.getSession();
    setUser(sessionUser);

    
    const projects = await api.getProjects();
    if (projects.length > 0) {
      navigate(`/dashboard/${projects[0]._id}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
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
