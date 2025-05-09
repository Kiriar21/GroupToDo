import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info] = useState(
    location.state?.fromRegister
      ? 'Zarejestrowano pomyślnie – możesz się teraz zalogować.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(nickname, password);
    } catch (err) {
      setError('Błąd logowania: ' + (err.response?.data?.message || 'niepoprawne dane'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Logowanie</Typography>
      {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Nickname"
          fullWidth margin="normal"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <TextField
          label="Hasło"
          type="password"
          fullWidth margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Zaloguj'}
        </Button>
      </Box>
      <Box mt={2}>
        <Typography>
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;