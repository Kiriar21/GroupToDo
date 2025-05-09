import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>,
  document.getElementById('root')
);