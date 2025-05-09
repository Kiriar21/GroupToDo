import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';

const darkTheme = createTheme({ palette: { mode: 'dark' } });
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={darkTheme}>
    <BrowserRouter>
    <CssBaseline />
    <AuthProvider>
      <App />
    </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
