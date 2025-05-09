import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(nickname, password);
    } catch (err) {
      setError('Błąd rejestracji: ' + (err.response?.data?.message || 'spróbuj ponownie'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Rejestracja</Typography>
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
          {loading ? <CircularProgress size={24} /> : 'Zarejestruj'}
        </Button>
      </Box>
      <Box mt={2}>
        <Typography>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;